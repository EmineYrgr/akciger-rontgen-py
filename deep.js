import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ImageUpload() {
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [processedImageUrls, setProcessedImageUrls] = useState([]);
    const [disease, setDisease] = useState('covid');  // Varsayılan hastalık türü

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
            formData.append('file', images[i]);
        }
        formData.append('disease', disease); // Hastalık türünü formData'ya ekle
        try {
            console.log("Submitting files:", images);
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Upload response:", response);
            const processedFiles = response.data;
            const urls = processedFiles.map(file => `http://localhost:5000/processed/${file.processed_filename}`);
            console.log("Processed URLs:", urls);
            setProcessedImageUrls(urls);
        } catch (error) {
            console.error('Error during file upload:', error);
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setImages(selectedFiles);

        const filePreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(filePreviews);
    };

    const handleDiseaseChange = (event) => {
        setDisease(event.target.value);
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#364252' }}>
                <div className="container">
                    <a className="navbar-brand" href="#">Medikal Görüntü Analizi</a>
                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="#">Akciğer Analizi</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Kemik Yoğunluğu Analizi</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Krarial BT</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Abdominal Röntgen</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Mamografi</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container my-5">
                <div className="image-upload-container">
                    <h2 className="mb-4">Görüntü Yükleme</h2>
                    <form onSubmit={handleSubmit} className="image-upload-form">
                        <div className="custom-file-upload mb-3">
                            <label htmlFor="file-upload" className="btn btn-primary">Görüntüleri Seç</label>
                            <input id="file-upload" type="file" onChange={handleFileChange} multiple hidden />
                        </div>
                        <select onChange={handleDiseaseChange} value={disease} className="form-select disease-select mb-3">
                            <option value="covid">COVID-19</option>
                            <option value="normal">Normal</option>
                            <option value="pjp">PJP</option>
                            <option value="sp">SP</option>
                        </select>
                        <button type="submit" className="btn btn-success upload-button">Gönder</button>
                    </form>
                </div>
                <div className="preview-images-container mt-4">
                    {previewUrls.length > 0 && (
                        <div className="container">
                            <h2>Seçilen Görüntüler</h2>
                            <div className="row row-cols-1 row-cols-md-3 g-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="col">
                                        <div className="card h-100">
                                            <img src={url} className="card-img-top" alt={`Preview ${index}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="processed-images-container mt-5">
                    {processedImageUrls.length > 0 && (
                        <div className="container">
                            <h2>İşlenmiş Görüntüler</h2>
                            <div className="row row-cols-1 row-cols-md-3 g-4">
                                {processedImageUrls.map((url, index) => (
                                    <div key={index} className="col">
                                        <div className="card h-100">
                                            <img src={url} className="card-img-top" alt={`Processed ${index}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Footer() {
    return (
        <footer className="footer" style={{ backgroundColor: '#364252', color: 'white' }}>
            <div className="container py-4">
                <div className="row">
                    <div className="col-lg-4">
                        <h5>Kurumsal</h5>
                        <ul className="list-unstyled">
                            <li><a className="text-light" href="#">Hakkımızda</a></li>
                            <li><a className="text-light" href="#">Gizlilik Politikası</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-4">
                        <h5>İletişim</h5>
                        <ul className="list-unstyled">
                            <li><a className="text-light" href="#">Ardıçlı Mah. İsmet Paşa Cad. No:351, 42250, Selçuklu/KONYA</a></li>
                            <li><a className="text-light" href="#">0(332) 223 2387-2388</a></li>
                            <li><a className="text-light" href="#">teknikbilimler@ktun.edu.tr</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-4">
                        <h5>Yardım</h5>
                        <ul className="list-unstyled">
                            <li><a className="text-light" href="#">Sıkça Sorulan Sorular</a></li>
                            <li><a className="text-light" href="#">Canlı Yardım</a></li>
                            <li><a className="text-light" href="#">İşlem Rehberi</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}


export default ImageUpload;