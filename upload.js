import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
    const [image, setImage] = useState(null);
    const [processedImageUrl, setProcessedImageUrl] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('İşlenmiş görüntü:', response.data);
            setProcessedImageUrl("http://localhost:5000/processed/${response.data.processed_filename}");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={(event) => setImage(event.target.files[0])} />
                <button type="submit">Gönder</button>
            </form>
            {processedImageUrl && <img src={processedImageUrl} alt="Processed Image" />}
        </div>
    );
}

export default ImageUpload;