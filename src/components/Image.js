import React, {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const cropper = React.createRef();

export default class Image extends Component {
    state = {
        cropped_image: null,
        show_crop_modal: false,
        image_to_upload: null,
        original_name: ''
    };

    handleHide = () => this.setState({show_crop_modal: false});

    onSelectFile = e => {
        if (e.target.files && e.target.files.length > 0) {
            this.setState({original_name: e.target.files[0].name})
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ image_to_upload: reader.result, show_crop_modal: true }),
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    handleFinalImage = () => {
        this.setState({show_crop_modal: false});
        cropper.current.getCroppedCanvas().toBlob(blob => {
            let data = new FormData();
            data.append('file', blob, this.state.original_name);
            this.props.upload(data);
        });
    };

    render(){
        let {show_crop_modal, image_to_upload} = this.state;
        let {width, height} = this.props;

        return(
            <Modal show={show_crop_modal} onHide={this.handleHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>برش تصویر</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{textAlign: "center"}}>
                        <Cropper
                            ref={cropper}
                            src={image_to_upload}
                            style={{height: 600, width: '100%'}}
                            aspectRatio={width/height}
                            guide={false}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleFinalImage}>انتخاب و ارسال</Button>
                    <Button onClick={this.handleHide}>بستن</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}