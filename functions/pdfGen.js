var PDFDocument, doc;
var fs = require('fs');
PDFDocument = require('pdfkit');
doc = new PDFDocument;




module.exports = {
    genpdf: async (filename, heading,body) => {
   
        try{ 
            // Pipe its output somewhere, like to a file or HTTP response
            file = './files/'+filename+'.pdf';
            console.log(file)
            doc.pipe(fs.createWriteStream(file));
            // PDF Creation logic goes here
            // Embed a font, set the font size, and render some text
            // Set a title and pass the X and Y coordinates
            doc.fontSize(15).text(heading, 50, 50, {align:'center'});
            // Set the paragraph width and align direction
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();
            doc.text(body, {
                width: 410,
                align: 'left',
                
            });


            // Finalize PDF file
            doc.end();
                        
                    }
                    catch(err){
                        return console.log(err);
                    }
                
                }
            }






