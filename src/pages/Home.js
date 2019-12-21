import React, {Component} from 'react';
import Chat from "./Chat";

export default class Home extends Component {
    state = {
        width: 0,
        height: 0,
    };

    componentDidMount(){
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        let headerRow = document.getElementById("header_row");
        this.setState({ width: window.innerWidth, height: window.innerHeight - headerRow.offsetHeight });
    };

    render(){
        let {width, height} = this.state;

        return (
            <div style={{position: "absolute", width, height, padding: "0 15px"}}>
                {/*<h2>استارتاپ مسنجر</h2>*/}
                <Chat width={width} height={height}/>
            </div>
        );
    }
}