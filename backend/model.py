import torch
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
import nltk
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
import os
import numpy as np
import re
from sklearn.metrics.pairwise import cosine_similarity
from scipy.stats import wasserstein_distance

nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

MINIMUM_PASSAGE_CHAR_LENTH = 20
MINIMUM_PASSAGE_WORD_LENTH = 5
GENERATED_TOPICS_COUNT = 5


class SemanticModel:
    def __init__(self):
        self.embedding_model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )
        self.stop_words = set(stopwords.words("english"))

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + " "
            return text
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {str(e)}")
            return ""

    def preprocess_text(self, text: str) -> list[str]:
        text = re.sub(r"\s+", " ", text).strip()

        sentences = sent_tokenize(text)

        # Combine short sentences into passages
        passages = []
        current_passage = ""

        for sentence in sentences:
            if (
                len(current_passage.split()) + len(sentence.split())
                < MINIMUM_PASSAGE_CHAR_LENTH
            ):
                current_passage += " " + sentence
            else:
                if current_passage:
                    passages.append(current_passage.strip())
                current_passage = sentence

        if current_passage:
            passages.append(current_passage.strip())

        return [
            passage
            for passage in passages
            if len(passage.split()) >= MINIMUM_PASSAGE_WORD_LENTH
        ]

    def get_embeddings(self, sentences):
        return self.embedding_model.encode(sentences, convert_to_tensor=True)

    def calculate_similarity(
        self, passage_embedding, topic_embedding, method="ensemble"
    ):
        # Convert PyTorch tensors to NumPy arrays if necessary
        if isinstance(passage_embedding, torch.Tensor):
            passage_embedding = passage_embedding.cpu().numpy()
        if isinstance(topic_embedding, torch.Tensor):
            topic_embedding = topic_embedding.cpu().numpy()

        # Reshape embeddings to 2D if they're 1D
        if passage_embedding.ndim == 1:
            passage_embedding = passage_embedding.reshape(1, -1)
        if topic_embedding.ndim == 1:
            topic_embedding = topic_embedding.reshape(1, -1)

        if method == "cosine":
            return cosine_similarity(passage_embedding, topic_embedding)[0][0]

        elif method == "euclidean":
            return 1 / (1 + np.linalg.norm(passage_embedding - topic_embedding))

        elif method == "manhattan":
            return 1 / (1 + np.sum(np.abs(passage_embedding - topic_embedding)))

        elif method == "wasserstein":
            passage_embedding_norm = passage_embedding / np.sum(passage_embedding)
            topic_embedding_norm = topic_embedding / np.sum(topic_embedding)
            distance = wasserstein_distance(
                passage_embedding_norm.flatten(), topic_embedding_norm.flatten()
            )
            return 1 / (1 + distance)

        elif method == "ensemble":
            cosine = cosine_similarity(passage_embedding, topic_embedding)[0][0]
            euclidean = 1 / (1 + np.linalg.norm(passage_embedding - topic_embedding))
            manhattan = 1 / (1 + np.sum(np.abs(passage_embedding - topic_embedding)))

            passage_embedding_norm = passage_embedding / np.sum(passage_embedding)
            topic_embedding_norm = topic_embedding / np.sum(topic_embedding)
            wasserstein = 1 / (
                1
                + wasserstein_distance(
                    passage_embedding_norm.flatten(), topic_embedding_norm.flatten()
                )
            )

            weights = [0.4, 0.2, 0.2, 0.2]
            return np.average(
                [cosine, euclidean, manhattan, wasserstein], weights=weights
            )

        else:
            raise ValueError(
                "Invalid similarity method. Choose from 'cosine', 'euclidean', 'manhattan', 'wasserstein', or 'ensemble'."
            )

    def generate_topics(self, text, num_topics=GENERATED_TOPICS_COUNT):
        words = word_tokenize(text.lower())
        words = [
            word for word in words if word.isalnum() and word not in self.stop_words
        ]

        # Identify important words to generate topics
        tfidf = TfidfVectorizer(max_features=100)
        tfidf_matrix = tfidf.fit_transform([" ".join(words)])
        feature_names = tfidf.get_feature_names_out()
        tfidf_scores = tfidf_matrix.toarray()[0]
        word_scores = list(zip(feature_names, tfidf_scores))
        word_scores.sort(key=lambda x: x[1], reverse=True)

        generated_topics = [word for word, score in word_scores[:num_topics]]

        return generated_topics

    def semantic_modeling(self, pdf_paths, user_topics, min_score=0.5):
        all_text = []
        all_sentences = []
        doc_lengths = []
        sentence_to_page = {} 

        for pdf_path in pdf_paths:
            reader = PdfReader(pdf_path)
            current_sentence_index = len(all_sentences)
            for page_num, page in enumerate(reader.pages, 1):
                text = page.extract_text()
                sentences = self.preprocess_text(text)
                all_text.extend(sentences)
                all_sentences.extend(sentences)
                # Map each sentence to its page number
                for i in range(len(sentences)):
                    sentence_to_page[current_sentence_index + i] = page_num
                current_sentence_index += len(sentences)
            doc_lengths.append(len(all_sentences) - current_sentence_index)

        print(f"Total number of sentences: {len(all_sentences)}")

        # Generate topics
        generated_topics = self.generate_topics(" ".join(all_text), num_topics=GENERATED_TOPICS_COUNT)
        all_topics = list(set(user_topics + generated_topics))

        # Get embeddings
        all_embeddings = self.get_embeddings(all_sentences)
        topic_embeddings = self.get_embeddings(all_topics)

        results = []
        for i, topic in enumerate(all_topics):
            similarities = [
                self.calculate_similarity(
                    all_embeddings[j], topic_embeddings[i], method="ensemble"
                )
                for j in range(len(all_embeddings))
            ]

            top_indices = torch.tensor(similarities).argsort(descending=True).tolist()

            topic_results = {"topic": topic, "similar_passages": []}

            current_doc = 0
            current_count = 0
            for idx in top_indices:
                while idx >= current_count + doc_lengths[current_doc]:
                    current_count += doc_lengths[current_doc]
                    current_doc += 1

                score = similarities[idx]
                if score > min_score:
                    passage = {
                        "text": all_sentences[idx],
                        "score": score,
                        "document": os.path.basename(pdf_paths[current_doc]),
                        "page": sentence_to_page[idx]  # Add the page number
                    }
                    topic_results["similar_passages"].append(passage)

            if topic_results["similar_passages"]:
                results.append(topic_results)

        return results