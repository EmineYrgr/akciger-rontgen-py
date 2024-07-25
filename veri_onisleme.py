from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator, img_to_array, load_img, array_to_img
import numpy as np
from flask_cors import CORS
import logging


app = Flask(__name__)
CORS(app)  

UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
PROCESSED_FOLDER = os.path.join(app.root_path, 'processed')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

# Uygulama için logging (günlükleme) ayarları yapılıyor
logging.basicConfig(level=logging.DEBUG)

# İşlenmiş dosyaları sunmak için bir route tanımlanıyor
@app.route('/processed/<filename>')
def send_processed_file(filename):
    app.logger.debug(f"Sending processed file: {filename}")
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename)

# Upload ve processed klasörleri oluşturuluyor
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# COVID-19 için veri artırma parametreleri
# COVID-19 akciğer görüntülerinde genellikle belirgin ve geniş yayılımlı lezyonlar görülür. Bu nedenle, geniş dönüşüm aralıkları kullanılabilir;
covid_datagen = ImageDataGenerator(
      rotation_range=7,        
    width_shift_range=0.05,  
    height_shift_range=0.05, 
    shear_range=0.1,         
    zoom_range=0.1,          
    horizontal_flip=False,   
    fill_mode='nearest',     
    brightness_range=[0.85, 1.15] 
)

# PJP (Pneumocystis jirovecii pneumonia) için veri artırma parametreleri
# PJP görüntülerinde daha ince yapılar ve küçük lezyonlar bulunabilir. Dolayısıyla, dönüşüm aralıklarının biraz daha dar olması faydalıdır;
pjp_datagen = ImageDataGenerator(
    rotation_range=7,        
    width_shift_range=0.05,  
    height_shift_range=0.05, 
    shear_range=0.1,         
    zoom_range=0.1,          
    horizontal_flip=False,   
    fill_mode='nearest',     
    brightness_range=[0.85, 1.15] 
) 

# SP (Streptococcus pneumoniae) için veri artırma parametreleri
# SP görüntülerinde belirgin konsolidasyon ve yoğun lezyonlar görülebilir. Orta dereceli dönüşüm aralıkları kullanarak veri çeşitliliği artırılabilir;
sp_datagen = ImageDataGenerator(
    rotation_range=7,
    width_shift_range=0.08,
    height_shift_range=0.08,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=False,
    fill_mode='nearest',
    brightness_range=[0.85, 1.15]
)

# Normal akciğer görüntüleri için veri artırma parametreleri
# Normal akciğer görüntülerinde homojen bir yapıya sahiptir. Bu nedenle, daha dar dönüşüm aralıkları kullanılabilir;
normal_datagen = ImageDataGenerator(
    rotation_range=5,
    width_shift_range=0.05,
    height_shift_range=0.05,
    shear_range=0.05,
    zoom_range=0.05,
    horizontal_flip=False,
    fill_mode='nearest',
    brightness_range=[0.5, 0.5]
)

@app.route('/upload', methods=['POST'])
def upload_file():
    app.logger.debug("Received a file upload request")
    files = request.files.getlist('file')  # İstemciden gelen dosyalar alınıyor
    disease = request.form.get('disease')  # İstemciden gelen hastalık türü alınıyor
    if not files or not disease:
        app.logger.error("No file part or disease specified in the request")
        return jsonify({'error': 'No file part or disease specified'})

    if disease not in ['covid', 'pjp', 'sp', 'normal']:
        app.logger.error("Invalid disease specified")
        return jsonify({'error': 'Invalid disease specified'})

    if disease == 'covid':
        datagen = covid_datagen
    elif disease == 'pjp':
        datagen = pjp_datagen
    elif disease == 'sp':
        datagen = sp_datagen
    elif disease == 'normal':
        datagen = normal_datagen

    processed_files_info = []

    for file in files:
        if file.filename == '':
            app.logger.debug("Empty filename encountered, skipping")
            continue
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)  # Dosya yükleniyor
        app.logger.debug(f"File saved: {filepath}")

        img = load_img(filepath)
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        for _, batch in enumerate(datagen.flow(img_array, batch_size=1)):
            processed_img = batch[0]
            processed_img = (processed_img * 255).astype(np.uint8)

            processed_filename = f'processed_{disease}_' + filename
            processed_filepath = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
            processed_img = processed_img.reshape((img.size[1], img.size[0], 3))
            processed_img_pil = array_to_img(processed_img)
            processed_img_pil.save(processed_filepath, format='JPEG')  # İşlenmiş dosya kaydediliyor
            app.logger.debug(f"Processed file saved: {processed_filepath}")

            processed_files_info.append({
                'original_filename': filename,
                'processed_filename': processed_filename
            })
            break

    app.logger.debug(f"Processed files info: {processed_files_info}")
    return jsonify(processed_files_info)  # İşlenmiş dosya bilgileri istemciye döndürülüyor

# Uygulama başlatılıyor
if __name__ == '__main__':
    app.run(debug=True)