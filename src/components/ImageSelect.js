import React, {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default class ImageSelect extends Component {

    constructor(props){
        super(props);
        this.state = {
            show_crop_modal: false,
            image_to_upload: null,
            crop: {
                aspect: props.width / props.height,
                width: props.width,
                x: 0,
                y: 0,
            },
            croppedImage: null
        };
        this.handleHide = this.handleHide.bind(this);
        this.handleFinalImage = this.handleFinalImage.bind(this);
    }

    b64toFile(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        let blob = new File(byteArrays, "jpeg" , {type: contentType});
        return blob;
    }

    onSelectFile = e => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ image_to_upload: reader.result, show_crop_modal: true }),
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    onImageLoaded = (image, pixelCrop) => {
        this.imageRef = image;
    };

    onCropComplete = (crop, pixelCrop) => {
        this.makeClientCrop(crop, pixelCrop);
    };

    onCropChange = crop => {
        this.setState({ crop });
    };

    async makeClientCrop(crop, pixelCrop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                pixelCrop,
                'newFile.jpeg',
            );
            this.setState({ croppedImageUrl });
        }
    }

    getCroppedImg(image, pixelCrop, fileName) {
        let width = pixelCrop.width;
        let height = pixelCrop.height;
        if(width > this.props.width){
            width = this.props.width;
            height = this.props.height;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            width,
            height,
        );

        this.setState({croppedImage: canvas.toDataURL('image/jpeg', 0.7)});

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });
    }

    handleHide() {
        this.setState({show_crop_modal: false});
    }

    handleFinalImage(){
        let ImageURL = this.state.croppedImage;
        let block = ImageURL.split(";");
        let contentType = block[0].split(":")[1];// In this case "image/gif"
        let realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
        this.setState({show_crop_modal: false});
        return this.b64toFile(realData, contentType);
    }

    changeCrop(width, height){
        this.setState({
            crop: {
                aspect: width / height,
                width: width,
                x: 0,
                y: 0,
            },
        });
    }

    render(){
        const {show_crop_modal, image_to_upload, crop} = this.state;

        return (
            <div>
                <Modal show={show_crop_modal} onHide={this.handleHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
                    <Modal.Header closeButton>
                        <Modal.Title>برش تصویر</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{textAlign: "center"}}>
                            {image_to_upload && (
                                <ReactCrop
                                    src={image_to_upload}
                                    crop={crop}
                                    onImageLoaded={this.onImageLoaded}
                                    onComplete={this.onCropComplete}
                                    onChange={this.onCropChange}
                                />
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.props.upload.bind(this)}>انتخاب و ارسال</Button>
                        <Button onClick={this.handleHide}>بستن</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}