import html2canvas from 'html2canvas';

export function saveElement(id, name='', i='') {
  const date = Date.now();
  const el = document.getElementById(id);
  html2canvas(el).then(canvas => {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', name + '_' + i + '_' + date + '.png');
    const dataURL = canvas.toDataURL('image/png');
    const url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  });
}
