import React, { useState } from 'react';
import "./componentscss/NO.css";
import axios from "axios";

function NO({ identifier, onRemove }) {

  const [showWarningPopup, setShowWarningPopup] = useState(false);

  const handleNoButtonClick = () =>{
    setShowWarningPopup(true);
  }
  const fileName = identifier.split('/').pop();
  const identifierArray = identifier.split('/');
  const identifierJetson = identifierArray[identifierArray.length - 4];
  const identifierDate = identifierArray[identifierArray.length - 3];
  const sourceKey = `Sterlite_Deployment/dashboard/${identifierJetson}/${identifierDate}//${fileName}`;
  // console.log(sourceKey);
  const handleOkClick = () =>{
     axios
    .post(`${process.env.REACT_APP_FETCH_LINK}moveAndDeleteImage`, { identifier })
    .then((response) => {
        // Handle a successful response here
        console.log('Image moved and deleted successfully',response.data);
    })
    .catch((error) => {
        // Handle errors
        console.error('Error moving and deleting image', error);
    });
  //   await axios
  // .delete(`http://localhost:7000/deleteImage/${identifier}`)
  // .then((response) => {
  //   // Handle a successful response here
  //   console.log('Image deleted successfully', response.data);
  // })
  // .catch((error) => {
  //   // Handle errors
  //   console.error('Error deleting image', error);
  // });
    // here do something if ok is clicked
    setShowWarningPopup(false);
    onRemove(identifier); // passing the identifier to the parent component 
  }

  const handleCancelClick = () =>{
    setShowWarningPopup(false);
  }
  // console.log(identifier)

  return (
    <div>
      <button className='no' onClick={handleNoButtonClick}>NO</button>

      {showWarningPopup && (
        <div className='warning-popup'>
          <p>Do you really want to remove the Defect?</p>
            <div className='warning-popup-buttons'>
              <button className='warning-popup-ok' onClick={handleOkClick}>OK</button>
              <button className='warning-popup-cancel' onClick={handleCancelClick}>Cancel</button>
            </div>
        </div>
      )}
    </div>
  )
}

export default NO;
