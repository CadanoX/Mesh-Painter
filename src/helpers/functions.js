const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function download(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function downloadString(text, filename) {
  download(new Blob([text], { type: 'text/plain' }), filename);
}

export function downloadArrayBuffer(buffer, filename) {
  download(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export function downloadJSON(data, filename) {
  downloadString(JSON.stringify(data, null, 2), filename);
}

export function fileReader(file){
  return new Promise((resolve, reject) => {
    var f = new FileReader();  
    f.onload = res => resolve(res.target.result);
    f.onerror = err => reject(err);
    f.readAsDataURL(file);
  });
}