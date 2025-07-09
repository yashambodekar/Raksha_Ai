import os
import sys
import numpy as np
import tensorflow as tf
import librosa
import subprocess
import warnings

# Suppress warnings and TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings("ignore")

# Load model and labels
script_dir = os.path.dirname(os.path.abspath(__file__))
labels_path = os.path.join(script_dir, "labels.txt")
model_path = os.path.join(script_dir, "soundclassifier_with_metadata.tflite")

with open(labels_path, "r", encoding="utf-8") as f:
    labels = [line.strip() for line in f.readlines()]

interpreter = tf.lite.Interpreter(model_path=model_path)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def convert_to_wav(original_path):
    if original_path.endswith(".wav"):
        return original_path

    wav_path = original_path.replace(".m4a", ".wav")
    ffmpeg_path = r"D:\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"

    try:
        result = subprocess.run([
            ffmpeg_path, "-y",
            "-i", original_path,
            "-ar", "16000", "-ac", "1",
            wav_path
        ], capture_output=True, text=True)

        if result.returncode != 0:
            print("⚠️ FFmpeg stderr:\n", result.stderr)
            return None

        return wav_path
    except Exception as e:
        print("❌ FFmpeg exception:", e)
        return None


def preprocess(file_path):
    y, sr = librosa.load(file_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)
    print("Audio duration (seconds):", duration)

    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))  # Normalize to [-1, 1]

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

    print("Feeding input to model...")
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])[0]

    print("Raw model output:", output_data)

    top_index = int(np.argmax(output_data))
    top_value = float(output_data[top_index])

    if np.isnan(top_value):
        print("Confidence is NaN")
        return "unknown", 0.0

    label_parts = labels[top_index].split(" ", 1)
    predicted_label = label_parts[1] if len(label_parts) > 1 else label_parts[0]
    predicted_label = predicted_label.lower()

    print("Predicted Label:", predicted_label)
    print("Confidence Score:", top_value)

    return predicted_label, top_value

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
