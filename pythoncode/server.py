from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import time

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Constants for measurement estimation
REFERENCE_HEIGHT_CM = 175  # Average height for scaling
REFERENCE_SHOULDER_CM = 45  # Average shoulder width for scaling

def process_image(image_data):
    try:
        # Convert base64 to OpenCV image
        nparr = np.frombuffer(base64.b64decode(image_data.split(',')[1]), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return {"error": "Invalid image data"}
            
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w = image.shape[:2]
        
        # Process image with MediaPipe Pose
        with mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=0.7
        ) as pose:
            results = pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return {"error": "No person detected in the image"}
            
            # Draw landmarks on image for debugging
            annotated_image = image.copy()
            mp_drawing.draw_landmarks(
                annotated_image, 
                results.pose_landmarks, 
                mp_pose.POSE_CONNECTIONS)
                
            # Convert annotated image back to base64
            _, buffer = cv2.imencode('.jpg', annotated_image)
            annotated_image_data = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "landmarks": results.pose_landmarks,
                "annotated_image": f"data:image/jpeg;base64,{annotated_image_data}",
                "image_dimensions": {"width": w, "height": h}
            }
            
    except Exception as e:
        return {"error": f"Image processing error: {str(e)}"}

def estimate_measurements(landmarks, image_width, image_height):
    try:
        # Get key points coordinates
        def get_coords(landmark_idx):
            lm = landmarks.landmark[landmark_idx]
            return [lm.x * image_width, lm.y * image_height]

        # Get required landmarks
        left_shoulder = get_coords(mp_pose.PoseLandmark.LEFT_SHOULDER)
        right_shoulder = get_coords(mp_pose.PoseLandmark.RIGHT_SHOULDER)
        left_hip = get_coords(mp_pose.PoseLandmark.LEFT_HIP)
        right_hip = get_coords(mp_pose.PoseLandmark.RIGHT_HIP)
        nose = get_coords(mp_pose.PoseLandmark.NOSE)
        left_ankle = get_coords(mp_pose.PoseLandmark.LEFT_ANKLE)
        right_ankle = get_coords(mp_pose.PoseLandmark.RIGHT_ANKLE)

        # Calculate distances in pixels
        def calculate_distance(a, b):
            return np.linalg.norm(np.array(a) - np.array(b))

        shoulder_px = calculate_distance(left_shoulder, right_shoulder)
        hip_px = calculate_distance(left_hip, right_hip)
        
        # Use average of both ankles for height calculation
        ankle_center = [(left_ankle[0] + right_ankle[0])/2, 
                       (left_ankle[1] + right_ankle[1])/2]
        height_px = calculate_distance(nose, ankle_center)

        # Estimate waist (adjust these ratios based on your needs)
        waist_px = (shoulder_px * 0.8 + hip_px * 0.9) / 2

        # Convert to cm using height as reference
        scale_factor = REFERENCE_HEIGHT_CM / height_px
        measurements = {
            "shoulder": round(shoulder_px * scale_factor, 1),
            "waist": round(waist_px * scale_factor, 1),
            "hips": round(hip_px * scale_factor, 1),
            "height": round(height_px * scale_factor, 1)
        }

        return measurements
        
    except Exception as e:
        return {"error": f"Measurement estimation error: {str(e)}"}

def determine_body_shape(measurements):
    try:
        shoulder = measurements['shoulder']
        waist = measurements['waist']
        hips = measurements['hips']
        
        # Calculate ratios
        shoulder_hip_ratio = shoulder / hips
        waist_shoulder_ratio = waist / shoulder
        waist_hip_ratio = waist / hips
        
        # Determine body shape
        if waist_shoulder_ratio < 0.75 and waist_hip_ratio < 0.75:
            if 0.95 < shoulder_hip_ratio < 1.05:
                return "Hourglass"
            elif shoulder_hip_ratio > 1.05:
                return "Inverted Triangle"
            else:
                return "Pear"
        elif waist_shoulder_ratio > 0.85 and waist_hip_ratio > 0.85:
            if shoulder_hip_ratio > 1.05:
                return "Apple"
            else:
                return "Rectangle"
        else:
            return "Rectangle"
            
    except Exception as e:
        return {"error": f"Body shape determination error: {str(e)}"}

@app.route('/analyze', methods=['POST'])
def analyze():
    start_time = time.time()
    
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image provided"}), 400
    
    # Step 1: Process image and detect landmarks
    processing_result = process_image(data['image'])
    if "error" in processing_result:
        return jsonify(processing_result), 400
    
    # Step 2: Estimate measurements
    measurements = estimate_measurements(
        processing_result["landmarks"],
        processing_result["image_dimensions"]["width"],
        processing_result["image_dimensions"]["height"]
    )
    if "error" in measurements:
        return jsonify(measurements), 400
    
    # Step 3: Determine body shape
    body_shape = determine_body_shape(measurements)
    if "error" in body_shape:
        return jsonify(body_shape), 400
    
    # Step 4: Generate recommendations
    recommendations = {
        "Hourglass": [
            "Fitted dresses that cinch at the waist",
            "High-waisted pants and skirts",
            "Belted jackets and coats",
            "Wrap dresses and tops"
        ],
        "Apple": [
            "V-neck tops to elongate the torso",
            "Empire waist dresses",
            "Dark colored tops with light bottoms",
            "Structured jackets that define shoulders"
        ],
        "Pear": [
            "A-line skirts to balance proportions",
            "Bootcut or flared jeans",
            "Tops with details on shoulders",
            "Dark bottoms with light tops"
        ],
        "Rectangle": [
            "Layered outfits to create dimension",
            "Peplum tops to create waist definition",
            "Off-shoulder tops to widen appearance",
            "Belts to create waist emphasis"
        ],
        "Inverted Triangle": [
            "V-neck tops to elongate the torso",
            "Wide-leg pants to balance shoulders",
            "A-line skirts to add volume to lower body",
            "Dark tops with light bottoms"
        ]
    }.get(body_shape, ["General fashion recommendations"])
    
    processing_time = round(time.time() - start_time, 2)
    
    return jsonify({
        "measurements": measurements,
        "body_shape": body_shape,
        "recommendations": recommendations,
        "annotated_image": processing_result["annotated_image"],
        "processing_time": processing_time
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)