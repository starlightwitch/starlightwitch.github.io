function htmlCellColourCode(score) {
    if (score >= 0 && score < 30) {
        return '#f6beb8';
    }

    if (score >= 30 && score <= 65) {
        return '#ffefbf';
    }

    if (score > 65 && score <= 100) {
        return '#a0e5a4';
    }
}

function getDateToday() {
    var objToday = new Date(),
        domEnder = function() {
            var a = objToday;
            if (/1/.test(parseInt((a + "").charAt(0)))) return "th";
            a = parseInt((a + "").charAt(1));
            return 1 == a ? "st" : 2 == a ? "nd" : 3 == a ? "rd" : "th"
        }(),
        dayOfMonth = today + (objToday.getDate() < 10) ? '0' + objToday.getDate() + domEnder : objToday.getDate() + domEnder,
        months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
        curMonth = months[objToday.getMonth()],
        curYear = objToday.getFullYear();
    var today = dayOfMonth + " " + curMonth + " " + curYear;
    return today;
}

// function footer(doc) {
//     doc.setFont(undefined, 'normal');
//     doc.setFontSize(12);
//     doc.text(150, 290, 'Created on website.com'); //add footer page
// }
function addFooters(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (doc.getPageWidth(i) > 211) { //page landscape
            // doc.text('Page ' + String(i) + "/" + pageCount, 260, 202);
            doc.text('Report created by TutorPal.co.uk', 230, 202);
        } else { //page portrait
            // doc.text('Page ' + String(i) + "/" + pageCount, 175, 290);
            doc.text('Report created by TutorPal.co.uk', 145, 290);
        }
    }
}

function generateReportPDF(class_name) {

    // Todays date
    var today_date = getDateToday();

    // General document information 
    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('p');
    let pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(28);

    /* FRONT PAGE START */
    //Where the page menu should start
    y = 20;

    // Consider 20 to be, 10 for left margin and right margin 
    var title = doc.splitTextToSize('"' + class_name + '"' + " Report", (pageWidth - 20));
    doc.text(title, pageWidth / 2, y, 'center');
    y += title.length * 10;
    doc.setFontSize(14);
    doc.setTextColor('#495057');
    doc.text(today_date, pageWidth / 2, y, 'center');
    y += 30;

    /* Contents page start */
    doc.setPage(1);
    doc.setTextColor('#000000');
    doc.setFont(undefined, 'bold');

    var yC = y;
    doc.text("Contents", 15, yC);

    yC += 10;
    doc.addPage('a4');

    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.setFont(undefined, 'normal');


    /* FRONT PAGE START */
    $('.card.tablesToPDF').each(function(index) {

        pageHeight = doc.internal.pageSize.height;


        y = 500;

        var pageTitle = $(this).find('.card-title.capitalize-text').text();
        // 
        if (index === 0) {


            pageTitle = $(this).find('.card-title').text();
            // the table title 
            doc.text(pageTitle, 15, 20)

            let Table = $(this).find('table');
            var res = doc.autoTableHtmlToJson(Table[0]); //convert the html table to javascript objects
            //head of table homework
            headTable = [res.columns];
            bodyTable = res.data;
            doc.autoTable({
                head: headTable,
                body: bodyTable,
                theme: 'grid',
                styles: {
                    halign: 'center'
                },
                startY: 30, //startY: Where the table should start to be printed
                didParseCell: function(data) { // override styles for a specific cell
                    var rows = data.table.body;
                    if (data.cell.section == "body") {
                        cellText = data.cell.text;
                        cellTextInt = cellText.toString().replace("%", "");
                        // if ($.isNumeric(cellTextInt)) {
                        //     data.cell.styles.fillColor = htmlCellColourCode(cellTextInt);
                        // }
                    }
                },
                headStyles: {
                    lineWidth: 0,
                    valign: 'top',
                    fontStyle: 'bold',
                    fillColor: '#f8f9fa',
                    textColor: '#000000',
                    lineWidth: 0.2
                },


                bodyStyles: {
                    lineWidth: 0.2,
                    textColor: '#000000',
                },
            });



            /* Contents page start */
            doc.setPage(1)
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.textWithLink(pageTitle, 15, yC, {
                pageNumber: doc.lastAutoTable.startPageNumber
            });
            // PageWidth - 30 start from right to left 
            doc.textWithLink(doc.lastAutoTable.startPageNumber.toString(), pageWidth - 15, yC, {
                align: 'right'
            }, {
                pageNumber: doc.lastAutoTable.startPageNumber
            });


        } else {
            let Table = $(this).find('table');

            if (index === 1) {
                doc.setFontSize(14);
                doc.text("Detailed Report", 15, 15);
            }
            // the table title 
            doc.setFontSize(12);
            if ($('.card.tablesToPDF table').length > 2) {
                doc.text(pageTitle, 15, 25)
            }

            var res = doc.autoTableHtmlToJson(Table[0]); //convert the html table to javascript objects
            //head of table homework
            headTable = [res.columns];
            bodyTable = res.data;
            doc.autoTable({
                head: headTable,
                body: bodyTable,
                theme: 'grid',
                styles: {
                    halign: 'center'
                },
                startY: 30, //startY: Where the table should start to be printed
                didParseCell: function(data) { // override styles for a specific cell
                    var rows = data.table.body;
                    if (data.cell.section == "body") {
                        cellText = data.cell.text;
                        cellTextInt = cellText.toString().replace("%", "");
                        // if ($.isNumeric(cellTextInt)) {
                        //     data.cell.styles.fillColor = htmlCellColourCode(cellTextInt);
                        // }


                    }

                    if (cellText[0] === 'lock') {
                        data.cell.text = ''
                    }
                },
                didDrawCell: function(data) { //draw additional cell content such as images lock
                    cellText = data.cell.text;

                    if (cellText[0] === '') {
                        var imgPDF = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAGYktHRAD/AP8A/6C9p5MAAAF2SURBVEhL7ZcxjoJAFIYfGxIbKaisvIGaGAwdBSWNegtbOQCJpbHgAF7BggQwlnoBKu0MDZ3GxsTSZNZ5vt1NRBk3S2ALvoT88Bj4gBmYILEbUAIflIXzK/HxeATHcaDb7UK9XodGowGmaYLrunA+n6nVm/BH/Q6LxYIpisK75elyuwi2Wq2otZi3xFwqSRIKhsMh22w27HK54LJer9lgMMB9siyzMAzpqGyE4sPh8H2ns9mMqmmm0ym2UVWVnU4nqr5GOKp5n0ZRBLVaDTzPo+pz+v0+XK9X0HUdJpMJVZ8jHFxBEGCOx2PMLGzbxvR9HzMLoTiOY0xN0zCz6PV6mPv9HjMLodgwDEz++oi4jQXMr2OyKO0Dkhpcy+USRqMRdDodqvyN7XYL8/kcLMuiyp2UuNlsQrvdpq182O12kCQJbd1JPeq8pZxWq0VrP5TWx5W4MCpxYVTiwvg/Yj6b5A2fJB5JifkUlqecS/k5H6l+YQoC4BO6DIHoM9GAOwAAAABJRU5ErkJggg==';
                        var dim = data.cell.height - data.cell.padding('vertical'); // dimension off image
                        var textPos = data.cell; // lock position 
                        doc.addImage(imgPDF, (textPos.x + textPos.width / 2) - 2, textPos.y + 2, dim, dim); //add image to cell
                    }

                },
                headStyles: {
                    lineWidth: 0,
                    valign: 'top',
                    fontStyle: 'bold',
                    fillColor: '#f8f9fa',
                    textColor: '#000000',
                    lineWidth: 0.2
                },


                bodyStyles: {
                    lineWidth: 0.2,
                    textColor: '#000000',
                },
            });


            /* Contents page start */
            doc.setPage(1)
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            if (index === 1) {
                doc.textWithLink("Detailed Report", 15, yC, {
                    pageNumber: doc.lastAutoTable.startPageNumber
                });
                // PageWidth - 30 start from right to left 
                doc.textWithLink(doc.lastAutoTable.startPageNumber.toString(), pageWidth - 15, yC, {
                    align: 'right'
                }, {
                    pageNumber: doc.lastAutoTable.startPageNumber
                });
            }

            if ($('.card.tablesToPDF table').length > 2) {
                doc.textWithLink(pageTitle, 20, yC + 10, {
                    pageNumber: doc.lastAutoTable.startPageNumber
                });
                // PageWidth - 30 start from right to left 
                doc.textWithLink(doc.lastAutoTable.startPageNumber.toString(), pageWidth - 15, yC + 10, {
                    align: 'right'
                }, {
                    pageNumber: doc.lastAutoTable.startPageNumber
                });
            }

        }

        yC += 10;
        if (y >= pageHeight) {
            doc.addPage();
            y = 0
        }


    });


    //blank page
    var pageCount = doc.internal.getNumberOfPages();
    doc.deletePage(pageCount);

    addFooters(doc);

    // Save file 
    var file_name = class_name + ' Report ' + today_date + '.pdf';
    file_name = file_name.toLowerCase();
    file_name = file_name.replace(/-/g, "");
    file_name = file_name.replace(/  /g, " ");
    file_name = file_name.replace(/ /g, "_");
    doc.save(file_name);
}