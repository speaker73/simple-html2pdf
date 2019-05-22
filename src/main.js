const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');
window.html2canvas = html2canvas;

module.exports = function () {
  return function (element, options, callback, jsPDFParams) {
    const defaultOptions = {
      filename: 'file.pdf',
      margin: 40,
      smart: true
    };
    options = ({}).toString.call(options) === '[object Object]' ?
      Object.assign({}, defaultOptions, options) : defaultOptions;

    if (typeof options === 'function') callback = options;

    const BEST_WIDTH = options.BEST_WIDTH || 795; // 元素宽度 + 2 * margin = 795 最适合打印
    const BEST_ELEMENT_WIDTH = options.BEST_ELEMENT_WIDTH || (BEST_WIDTH - 2 * options.margin);

    let freeElement = element;
    let printFF = null;

    if (options.smart) {
      if (({}).toString.call(element) === '[object HTMLBodyElement]') {
        const pageHTML = document.documentElement.outerHTML;
        printFF = document.createElement('iframe');
        printFF.frameBorder = '0';
        printFF.style.width = `${freeElement.offsetWidth}px`;
        printFF.style.height = `${freeElement.offsetHeight}px`;
        printFF.style.position = 'fixed';
        printFF.style.left = 0;
        printFF.style.top = 0;
        printFF.style.opacity = 0;
        printFF.style.zIndex = -1;
        document.body.appendChild(printFF);
        printFF.contentDocument.write(pageHTML);

        if (freeElement.offsetWidth < freeElement.scrollWidth) {
          printFF.style.width = `${freeElement.scrollWidth + freeElement.offsetWidth -
            freeElement.clientWidth}px`;
        } else if (freeElement.offsetWidth > BEST_ELEMENT_WIDTH) {
          printFF.style.width = `${BEST_ELEMENT_WIDTH}px`;
          if (printFF.contentDocument.body.offsetWidth < printFF.contentDocument.body.scrollWidth) {
            printFF.style.width = `${printFF.contentDocument.body.scrollWidth +
              printFF.contentDocument.body.offsetWidth - printFF.contentDocument.body.clientWidth}px`;
          }
        }
        freeElement = printFF.contentDocument.body;
      } else {
        freeElement = element.cloneNode(true);
        const printCC = document.createElement('div');
        printCC.style.position = 'fixed';
        printCC.style.left = 0;
        printCC.style.top = 0;
        printCC.style.opacity = 0;
        printCC.style.zIndex = -1;
        printCC.appendChild(freeElement);
        element.parentNode.appendChild(printCC)

        if (freeElement.offsetWidth < freeElement.scrollWidth) {
          freeElement.style.width = `${freeElement.scrollWidth + freeElement.offsetWidth -
            freeElement.clientWidth}px`;
        } else if (freeElement.offsetWidth > BEST_ELEMENT_WIDTH) {
          freeElement.style.width = `${BEST_ELEMENT_WIDTH}px`;
          if (freeElement.offsetWidth < freeElement.scrollWidth) {
            freeElement.style.width = `${freeElement.scrollWidth + freeElement.offsetWidth -
              freeElement.clientWidth}px`;
          }
        }
      }
    }
    const pdfParams = jsPDFParams || {
      orientation:'p',
      unit: 'px',
      format: 'a4',
    };
    const pdf = new jsPDF( pdfParams);

    pdf.html(freeElement, {
      callback:function(){
        pdf.save(options.filename);
        if (printFF) document.body.removeChild(printFF);
        if (typeof callback === 'function') callback();
      }
    });

  }
};
