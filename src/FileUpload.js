import React from 'react';
import './App.css';

function FileUpload(props) {
	return (
		<div className="fileContainer">
			<form>
				<input
					type="file"
					style={{ display: "none" }}
				/>
				<div className="fileUploadContainer">
					<div className="fileUploadText">
						<span className="browseSpan">Browse</span>
						<p className="browseSubTxt" > Supported file formats are .xlsx</p>
					</div>

				</div>
			</form>
		</div>
	);
}

// class FileUpload extends React.Component {
// 	render() {

// 	}
// }

export default FileUpload;