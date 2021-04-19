import './Microphone.css';
import {ReactComponent as MicrophoneIcon} from '../assets/microphone.svg';

const Microphone =  ({isVisible}) => {
    return(
        <div className="microphone-wrapper">
            {isVisible ? <MicrophoneIcon/> : null}
        </div>
    )
};

export default Microphone;