from transformers import AutoTokenizer, AutoModel
import torch
import sys
import json

# Load the model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

def generate_embeddings(text):
    try:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            outputs = model(**inputs)
        embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()  # Average pooling
        return embeddings
    except Exception as e:
        print(f"Error in generating embeddings: {str(e)}")
        sys.exit(1)  # Exit if there's an error

if __name__ == "__main__":
    try:
        input_text = sys.argv[1]
        embeddings = generate_embeddings(input_text)
        # Print the embeddings as a JSON string
        print(json.dumps(embeddings))
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
