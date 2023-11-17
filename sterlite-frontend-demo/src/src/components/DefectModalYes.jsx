import React, { useState } from 'react';
import "./componentscss/DefectModal.css";
import axios from "axios"; 

function DefectModalYes({ onClose, identifier }) {
    const Defects = ["Patch", "Dent", "Loose Wire", "Black Wire", "Others"];
    const [selectedDefect, setSelectedDefect] = useState("");
    const [defectToSubmit, setDefectToSubmit] = useState("");
    const [otherDefect,setOtherDefect] =useState("");// New state to be sent in the request

    const handleSelectedDefect = (event) => {
        const value = event.target.value;
        setSelectedDefect(value);

        // Update the state to be sent in the request
        if (value === "Others") {
            setDefectToSubmit(otherDefect);
        } else {
            setDefectToSubmit(value);
        }
    }

    const handleOtherDefect = (event) => {
        setOtherDefect(event.target.value);
        setDefectToSubmit(`Others/${event.target.value}`); // Update the state to be sent in the request
    }

    const handleConfirm = () => {
        // Prepare the data to send in the request body
        const data = {
            defect: defectToSubmit, // Use the new state variable here
            identifier: identifier,
        };

        // Make a POST request to the server
        axios.post(`${process.env.REACT_APP_FETCH_LINK}copyImage`, data)
            .then(response => {
                // Handle the response if needed
                console.log('Image copied successfully', response.data);
            })
            .catch(error => {
                // Handle errors
                console.error('Error copying image', error);
            });

        onClose(); // Close the modal
    }

    return (
        <div className='defect-modal-overlay'>
            <div className='defect-modal'>
                <div className='select-container'>
                    <select className='select-modal' value={selectedDefect} onChange={handleSelectedDefect}>
                        <option value="" hidden> Select Defect</option>
                        {Defects.map((defect, index) => (
                            <option className='select-option' key={index} value={defect}>
                                {defect}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedDefect === "Others" && (
                    <input
                        className='ip-field'
                        type="text"
                        value={otherDefect}
                        onChange={handleOtherDefect}
                        placeholder="Enter defect..."
                    />
                )}
                <div className="button-container-modal">
                    <button className='ok' onClick={handleConfirm}>OK</button>
                    <button className='cancel' onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default DefectModalYes;