import os
import sys
import numpy as np
import tensorflow as tf
import librosa
import subprocess
import warnings

# Suppress all non-critical logs and warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings("ignore")

# === Load model and labels ===
script_dir = os.path.dirname(os.path.abspath(__file__))
labels_path = os.path.join(script_dir, "labels.txt")
model_path = os.path.join(script_dir, "soundclassifier_with_metadata.tflite")

with open(labels_path, "r") as f:
    labels = [line.strip() for line in f.readlines()]

interpreter = tf.lite.Interpreter(model_path=model_path)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


def convert_to_wav(original_path):
    if original_path.endswith(".wav"):
        return original_path  # Already .wav

    wav_path = original_path.replace(".m4a", ".wav")
    ffmpeg_path = r"D:\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"  # Update if needed

    try:
        subprocess.run([
            ffmpeg_path, "-y",
            "-i", original_path,
            "-ar", "16000", "-ac", "1",
            wav_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return wav_path
    except subprocess.CalledProcessError as e:
        print("FFmpeg conversion failed:", str(e))
        return None


def preprocess(file_path):
    y, sr = librosa.load(file_path, sr=16000)
    required_length = 44032
    if len(y) < required_length:
        y = np.pad(y, (0, required_length - len(y)))
    else:
        y = y[:required_length]
    return np.array(y, dtype=np.float32).reshape(1, required_length)


def predict(file_path):
    wav_path = convert_to_wav(file_path)
    if not wav_path:
        return "unknown", 0.0

    input_data = preprocess(wav_path)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])[0]
    top_index = np.argmax(output_data)

    label_parts = labels[top_index].split(" ", 1)
    predicted_label = label_parts[1] if len(label_parts) > 1 else label_parts[0]
    predicted_label = predicted_label.lower()
    confidence = float(output_data[top_index])

    return predicted_label, confidence


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python classify_audio.py <audio_file_path>")
        sys.exit(1)

    audio_path = sys.argv[1]
    if not os.path.isfile(audio_path):
        print(f"File not found: {audio_path}")
        sys.exit(1)

    label, confidence = predict(audio_path)
    print(f"{label},{confidence}")
