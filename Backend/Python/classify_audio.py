import os
import sys
import numpy as np
import tensorflow as tf
import librosa

# Always load labels.txt from the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
labels_path = os.path.join(script_dir, "labels.txt")
with open(labels_path, "r") as f:
    labels = [line.strip() for line in f.readlines()]

# Load the TFLite model
model_path = os.path.join(script_dir, "soundclassifier_with_metadata.tflite")
interpreter = tf.lite.Interpreter(model_path=model_path)
interpreter.allocate_tensors()

# Get input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def preprocess(file_path):
    # Load the audio file and resample to 16kHz
    y, sr = librosa.load(file_path, sr=16000)

    # Ensure the audio is the required length (44032 samples)
    required_length = 44032
    if len(y) < required_length:
        y = np.pad(y, (0, required_length - len(y)))  # pad short audio
    else:
        y = y[:required_length]  # trim long audio

    # Reshape to match input shape
    y = np.array(y, dtype=np.float32).reshape(1, required_length)
    return y

def predict(file_path):
    input_data = preprocess(file_path)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()

    output_data = interpreter.get_tensor(output_details[0]['index'])[0]
    top_index = np.argmax(output_data)
    predicted_label = predicted_label = labels[top_index].split(" ", 1)[1]
    confidence = float(output_data[top_index])
    
    return predicted_label, confidence

# Main entry point: get audio path from command line
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python classify_audio.py <audio_file_path>")
        sys.exit(1)
    audio_path = sys.argv[1]
    label, confidence = predict(audio_path)
    print(f"{label},{confidence}")