import Loader from 'react-loader-spinner';
import React from "react";

const ButtonLoader = (props) => {
    return (
        <div>
            {!props.loading ? (
                <button className="btn" onClick={props.onClick}>{props.text}</button>
            ) : (
                <button className="btn">
                    <Loader type="TailSpin" color="#fff" height="20" width="20"></Loader>
                </button>
            )}
        </div>
    );
};
export default ButtonLoader;