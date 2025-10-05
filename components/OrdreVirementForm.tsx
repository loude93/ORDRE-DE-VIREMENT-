
import React, { useState } from 'react';
import { CURRENCIES } from '../constants';
import { Supplier, MyAccountDetails } from '../types';

declare const window: any;

// Helper for text wrapping in PDF
const breakTextIntoLines = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
    const words = text.split(' ');
    if (!words.length) return [];

    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = `${currentLine} ${word}`;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
};


const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <p className="mt-1 text-md text-gray-800 font-mono bg-gray-100 p-2 rounded-md">{value}</p>
  </div>
);

const InputField: React.FC<{ label: string; id: string; type?: string; placeholder?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children?: React.ReactNode; }> = ({ label, id, type = 'text', placeholder, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {children}
            <input 
                type={type} 
                name={id} 
                id={id}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-3"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete="off"
            />
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, id, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <select 
            id={id} 
            name={id} 
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={value}
            onChange={onChange}
        >
            {children}
        </select>
    </div>
);

const Toast: React.FC = () => (
    <div 
        className="fixed top-5 right-5 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-fade-in-down"
        role="alert"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Ordre de virement généré avec succès !</span>
    </div>
);

// Helper function to convert number to French words including decimals
const numberToFrenchWords = (n: number, mainUnit: string, subUnit: string): string => {
    const integerToWords = (numToConvert: number): string => {
        const num = Math.floor(numToConvert);
        if (num === 0) return 'zéro';

        const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
        const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
        const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

        const convertChunk = (chunk: number): string => {
            if (chunk === 0) return '';
            let words = '';

            const hundreds = Math.floor(chunk / 100);
            const remainder = chunk % 100;

            if (hundreds > 0) {
                words += (hundreds > 1 ? units[hundreds] + ' ' : '') + 'cent';
                if (remainder === 0 && hundreds > 1) words += 's';
                else words += ' ';
            }

            if (remainder > 0) {
                if (remainder < 10) {
                    words += units[remainder];
                } else if (remainder < 20) {
                    words += teens[remainder - 10];
                } else {
                    const ten = Math.floor(remainder / 10);
                    const unit = remainder % 10;
                    if (ten === 7 || ten === 9) {
                        words += tens[ten - 1] + '-' + teens[unit];
                    } else {
                        words += tens[ten];
                        if (unit > 0) {
                            words += (ten === 8 && unit > 0 ? '' : (unit === 1 && ten !== 8 ? ' et ' : '-')) + units[unit];
                        } else if (ten === 8) {
                            words += 's';
                        }
                    }
                }
            }
            return words.trim();
        };

        if (num < 0) return 'moins ' + integerToWords(Math.abs(num));
        if (num < 1000) return convertChunk(num);

        const chunkNames = ['', 'mille', 'million', 'milliard', 'trillion'];
        let result = '';
        let chunkIndex = 0;
        let tempNum = num;

        while (tempNum > 0) {
            const chunk = tempNum % 1000;
            if (chunk > 0) {
                let chunkStr = convertChunk(chunk);
                if (chunkIndex > 0) {
                    if (chunk === 1 && chunkIndex === 1) {
                        chunkStr = ''; // 'un mille' becomes 'mille'
                    }
                    result = chunkStr + ' ' + chunkNames[chunkIndex] + (chunk > 1 && chunkIndex > 1 ? 's' : '') + ' ' + result;
                } else {
                    result = chunkStr;
                }
            }
            tempNum = Math.floor(tempNum / 1000);
            chunkIndex++;
        }

        return result.trim().replace(/\s+/g, ' ');
    };

    const integerPart = Math.floor(n);
    const decimalPart = Math.round((n - integerPart) * 100);
    
    const integerWords = integerToWords(integerPart);
    const capitalizedIntegerWords = integerWords.charAt(0).toUpperCase() + integerWords.slice(1);

    const mainUnitText = mainUnit + (integerPart > 1 ? 's' : '');
    let finalResult = `${capitalizedIntegerWords} ${mainUnitText}`;

    if (decimalPart > 0) {
        const decimalWords = integerToWords(decimalPart);
        const subUnitText = subUnit + (decimalPart > 1 ? 's' : '');
        finalResult += ` et ${decimalWords} ${subUnitText}`;
    }

    return finalResult;
};

interface OrdreVirementFormProps {
  suppliers: Supplier[];
  accounts: MyAccountDetails[];
}

const OrdreVirementForm: React.FC<OrdreVirementFormProps> = ({ suppliers, accounts }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency] = useState<string>(CURRENCIES[0]);
  const [purpose, setPurpose] = useState<string>('');
  const [isExpressTransfer, setIsExpressTransfer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const filteredSuppliers = supplierSearch 
    ? suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase())) 
    : [];

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccountId(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !selectedSupplier || !amount || !purpose) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }
    
    setIsGenerating(true);

    const { PDFDocument, rgb, StandardFonts, PageSizes } = window.PDFLib;

    try {
        let pdfBytes;
        
        const date = new Date().toLocaleDateString('fr-FR');
        const transferType = isExpressTransfer ? 'Virement bancaire EXPRESS' : 'Virement bancaire';
        const currencyDetails = {
            MAD: { main: 'dirham', sub: 'centime' }
        };
        const mainUnit = currencyDetails[currency as keyof typeof currencyDetails]?.main || currency.toLowerCase();
        const subUnit = currencyDetails[currency as keyof typeof currencyDetails]?.sub || 'centime';
        const amountInWords = numberToFrenchWords(parseFloat(amount), mainUnit, subUnit);

        if (selectedAccount.letterhead?.dataUrl) {
            // --- LOGIC for custom letterheads with new letter format ---
            const base64 = selectedAccount.letterhead.dataUrl.split(',')[1];
            const binaryString = atob(base64);
            const len = binaryString.length;
            const existingPdfBytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                existingPdfBytes[i] = binaryString.charCodeAt(i);
            }
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontSize = 11;

            const CM_TO_POINTS = 28.3465;
            const LEFT_MARGIN = 5.5 * CM_TO_POINTS;
            const RIGHT_ALIGN_X = width - (1 * CM_TO_POINTS);
            const DATE_Y_OFFSET = 5 * CM_TO_POINTS;
            const SIGNATURE_Y_FROM_BOTTOM = 7 * CM_TO_POINTS;

            // Date
            const dateY = height - DATE_Y_OFFSET;
            const dateText = `Fait à Casablanca, le ${date}`;
            const dateTextWidth = font.widthOfTextAtSize(dateText, fontSize);
            firstPage.drawText(dateText, { x: RIGHT_ALIGN_X - dateTextWidth, y: dateY, font, size: fontSize, color: rgb(0, 0, 0) });
            
            // Add bank address below date
            const bankAddressText = selectedAccount.bankAddress;
            const bankAddressTextWidth = font.widthOfTextAtSize(bankAddressText, fontSize);
            firstPage.drawText(bankAddressText, { x: RIGHT_ALIGN_X - bankAddressTextWidth, y: dateY - 15, font, size: fontSize, color: rgb(0, 0, 0) });

            // Content
            let yPos = dateY - 80;
            const lineHeight = 18;

            const drawLine = (text: string, isBold = false, indent = false) => {
                firstPage.drawText(text, {
                    x: LEFT_MARGIN + (indent ? 20 : 0),
                    y: yPos,
                    font: isBold ? boldFont : font,
                    size: isBold ? fontSize + 1 : fontSize,
                    color: rgb(0, 0, 0)
                });
                yPos -= lineHeight;
            };

            drawLine(`Objet : ${transferType}`, true);
            yPos -= lineHeight * 1.5;

            drawLine("Madame, Monsieur,");
            yPos -= lineHeight;
            
            drawLine(`Par le débit de notre compte N° ${selectedAccount.rib}, ouvert à vos livres`);
            drawLine(`d'${selectedAccount.bankAddress}, nous vous demandons`);
            drawLine(`d'effectuer un virement en faveur de :`);
            yPos -= lineHeight;

            drawLine(`Titulaire : ${selectedSupplier.name}`, false, true);
            drawLine(`RIB : ${selectedSupplier.rib}`, false, true);
            yPos -= lineHeight;
            
            drawLine(`Montant en chiffres : ${parseFloat(amount).toFixed(2)} ${currency}`, false, true);
            
            // WRAPPING LOGIC FOR AMOUNT IN WORDS
            const labelXForAmount = LEFT_MARGIN + 20; // Consistent with drawLine's indent
            const valueXForAmount = LEFT_MARGIN + 140; // Set a fixed X for the value to align it properly
            const textMaxWidthForAmount = width - valueXForAmount - (1 * CM_TO_POINTS); // Calculate max width for value

            // Draw the label
            firstPage.drawText('Montant en lettres :', {
                x: labelXForAmount,
                y: yPos,
                font: font,
                size: fontSize,
                color: rgb(0, 0, 0),
            });

            // Prepare and wrap the value text
            const amountInWordsValue = `${amountInWords}.`;
            const linesForAmount = breakTextIntoLines(amountInWordsValue, font, fontSize, textMaxWidthForAmount);
            
            // Draw each line of the wrapped value
            linesForAmount.forEach((line, index) => {
                // The first line of the value shares the Y position of the label.
                // Subsequent lines get a new, lower Y position.
                firstPage.drawText(line, {
                    x: valueXForAmount,
                    y: yPos,
                    font: font,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
                if (index < linesForAmount.length - 1) {
                    yPos -= lineHeight; // Decrement Y for the next line of text
                }
            });
            yPos -= lineHeight; // Decrement Y to move below the amount in words block
            
            yPos -= lineHeight;

            drawLine(`Motif : ${purpose}`, false, true);
            
            // Signature
            const signatureY = SIGNATURE_Y_FROM_BOTTOM;
            const signatureText = "Cachet et Signature";
            const signatureBlockWidth = 200; 

            const signatureTextWidth = font.widthOfTextAtSize(signatureText, fontSize);
            firstPage.drawText(signatureText, { x: RIGHT_ALIGN_X - signatureTextWidth, y: signatureY + 10, font, size: fontSize });

            firstPage.drawLine({
                start: { x: RIGHT_ALIGN_X - signatureBlockWidth, y: signatureY },
                end: { x: RIGHT_ALIGN_X, y: signatureY },
                thickness: 1, color: rgb(0, 0, 0),
            });
            
            const signatoryNameText = selectedAccount.signatoryName;
            const signatoryNameWidth = boldFont.widthOfTextAtSize(signatoryNameText, fontSize + 1);
            firstPage.drawText(signatoryNameText, { x: RIGHT_ALIGN_X - signatoryNameWidth, y: signatureY - 15, font: boldFont, size: fontSize + 1 });
            
            pdfBytes = await pdfDoc.save();

        } else {
            // --- PROFESSIONAL TEMPLATE LOGIC (updated with letter format) ---
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage(PageSizes.A4);
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            const margin = 50;
            const ONE_CM_IN_POINTS = 28.35;
            const rightAlignX = width - ONE_CM_IN_POINTS;

            const primaryColor = rgb(0.05, 0.2, 0.45);
            const secondaryColor = rgb(0.3, 0.3, 0.3);
            const lineColor = rgb(0.85, 0.85, 0.85);

            // Header
            page.drawSvgPath('M13 10V3L4 14h7v7l9-11h-7z', { x: margin, y: height - margin - 5, color: primaryColor, scale: 1.5 });
            page.drawText('RASMAL GROUP', { x: margin + 40, y: height - margin, font: boldFont, size: 20, color: primaryColor });
            page.drawLine({ start: { x: margin, y: height - margin - 40 }, end: { x: width - margin, y: height - margin - 40 }, thickness: 1, color: lineColor });
            
            // Title
            const titleY = height - margin - 90;
            page.drawText('ORDRE DE VIREMENT BANCAIRE', { x: width / 2 - 150, y: titleY, font: boldFont, size: 18, color: secondaryColor });
            
            // Content
            let currentY = titleY - 70;
            const lineHeight = 18;
            const baseFontSize = 11;
            
            const drawTextLine = (text: string, isBold: boolean = false, customY?: number) => {
                page.drawText(text, {
                    x: margin,
                    y: customY || currentY,
                    font: isBold ? boldFont : font,
                    size: baseFontSize,
                    color: rgb(0, 0, 0)
                });
                if(!customY) currentY -= lineHeight;
            };

            drawTextLine(`Objet : ${transferType}`, true);
            currentY -= lineHeight * 1.5;

            drawTextLine("Madame, Monsieur,");
            currentY -= lineHeight;

            drawTextLine(`Par le débit de notre compte N° ${selectedAccount.rib}, ouvert à vos livres`);
            drawTextLine(`d'${selectedAccount.bankAddress}, nous vous prions de bien vouloir exécuter l'ordre`);
            drawTextLine(`de virement suivant en faveur de :`);
            currentY -= lineHeight;
            
            page.drawText('Titulaire :', { x: margin + 20, y: currentY, font: font, size: baseFontSize });
            page.drawText(selectedSupplier.name, { x: margin + 150, y: currentY, font: boldFont, size: baseFontSize });
            currentY -= lineHeight;
            page.drawText('RIB :', { x: margin + 20, y: currentY, font: font, size: baseFontSize });
            page.drawText(selectedSupplier.rib, { x: margin + 150, y: currentY, font: boldFont, size: baseFontSize });
            currentY -= lineHeight * 1.5;
            
            page.drawText('Montant en chiffres :', { x: margin + 20, y: currentY, font: font, size: baseFontSize });
            page.drawText(`${parseFloat(amount).toFixed(2)} ${currency}`, { x: margin + 150, y: currentY, font: boldFont, size: baseFontSize });
            currentY -= lineHeight;
            
            // WRAPPING LOGIC FOR AMOUNT IN WORDS
            page.drawText('Montant en lettres :', { x: margin + 20, y: currentY, font: font, size: baseFontSize });
            const valueMaxWidth = width - (margin + 150) - margin;
            const amountInWordsValue = `${amountInWords}.`;
            const amountLines = breakTextIntoLines(amountInWordsValue, boldFont, baseFontSize, valueMaxWidth);
            amountLines.forEach((line, index) => {
                page.drawText(line, {
                    x: margin + 150,
                    y: currentY,
                    font: boldFont,
                    size: baseFontSize,
                    color: rgb(0, 0, 0),
                });
                if (index < amountLines.length - 1) {
                    currentY -= lineHeight;
                }
            });
            currentY -= lineHeight * 2;
            
            page.drawText('Motif :', { x: margin + 20, y: currentY, font: font, size: baseFontSize });
            page.drawText(purpose, { x: margin + 150, y: currentY, font: boldFont, size: baseFontSize });
            currentY -= lineHeight;

            // Date & Signature
            const dateText = `Fait à Casablanca, le ${date}`;
            const dateTextWidth = font.widthOfTextAtSize(dateText, 10);
            page.drawText(dateText, {
                x: rightAlignX - dateTextWidth,
                y: 180,
                font: font,
                size: 10,
                color: secondaryColor,
            });

            // Add bank address below date
            const bankAddressText = selectedAccount.bankAddress;
            const bankAddressTextWidth = font.widthOfTextAtSize(bankAddressText, 10);
            page.drawText(bankAddressText, {
                x: rightAlignX - bankAddressTextWidth,
                y: 180 - 15,
                font: font,
                size: 10,
                color: secondaryColor,
            });

            const signatureY = 120;
            const signatureLineWidth = 220;
            const signatureLabel = 'Cachet et Signature';
            const signatureLabelWidth = font.widthOfTextAtSize(signatureLabel, 10);
            
            page.drawText(signatureLabel, { x: rightAlignX - signatureLabelWidth, y: signatureY, font: font, size: 10, color: secondaryColor });
            page.drawLine({ start: { x: rightAlignX - signatureLineWidth, y: signatureY - 10 }, end: { x: rightAlignX, y: signatureY - 10 }, thickness: 1, color: secondaryColor });
            
            const signatoryText = selectedAccount.signatoryName;
            const signatoryTextWidth = boldFont.widthOfTextAtSize(signatoryText, 10);
            page.drawText(signatoryText, { x: rightAlignX - signatoryTextWidth, y: signatureY - 25, font: boldFont, size: 10, color: secondaryColor });
    
            // Footer
            page.drawLine({ start: { x: margin, y: margin + 20 }, end: { x: width - margin, y: margin + 20 }, thickness: 0.5, color: lineColor });
            page.drawText("RASMAL GROUP. Tous droits réservés © 2025.", {
              x: margin,
              y: margin, font: font, size: 8, color: secondaryColor
            });
            page.drawText('Page 1 sur 1', {
              x: width - margin - 50,
              y: margin, font: font, size: 8, color: secondaryColor
            });
            
            pdfBytes = await pdfDoc.save();
        }


        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ordre_virement_${selectedSupplier.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        let errorMessage = "Une erreur est survenue lors de la génération du PDF.";
        if (error instanceof Error && error.message.includes('No PDF header found')) {
            errorMessage += " Le fichier papier à en-tête est peut-être corrompu ou dans un format incorrect.";
        }
        alert(errorMessage);
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <>
      {showSuccessToast && <Toast />}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <FormSection title="Donneur d'ordre (Applicant)">
          <SelectField 
              label="Sélectionner un compte donneur d'ordre" 
              id="account"
              value={selectedAccountId}
              onChange={handleAccountChange}
          >
            <option value="">-- Choisissez un compte --</option>
            {accounts
              .slice()
              .sort((a, b) => a.companyName.localeCompare(b.companyName))
              .map((account) => (
                <option key={account.id} value={account.id}>{account.companyName}</option>
            ))}
          </SelectField>

          {selectedAccount && (
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-4">
                  <ReadOnlyField label="Nom de la société" value={selectedAccount.companyName} />
                  <ReadOnlyField label="Votre RIB" value={selectedAccount.rib} />
                   <ReadOnlyField label="Nom du Signataire" value={selectedAccount.signatoryName} />
                  <ReadOnlyField label="Adresse de la banque" value={selectedAccount.bankAddress} />
                  <ReadOnlyField label="Papier à en-tête" value={selectedAccount.letterhead?.name || 'Non spécifié'} />
              </div>
          )}
        </FormSection>

        <FormSection title="Bénéficiaire (Beneficiary)">
          {selectedSupplier ? (
              <>
                  <div className="space-y-4">
                      <ReadOnlyField label="Nom du fournisseur" value={selectedSupplier.name} />
                      <ReadOnlyField label="RIB du fournisseur" value={selectedSupplier.rib} />
                  </div>
                  <div className="text-right mt-4">
                      <button
                          type="button"
                          onClick={() => setSelectedSupplierId('')}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                          Changer de fournisseur
                      </button>
                  </div>
              </>
          ) : (
              <div className="relative">
                  <InputField
                      label="Rechercher un fournisseur"
                      id="supplier-search"
                      placeholder="Tapez le nom du fournisseur..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                  />
                  {supplierSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredSuppliers.length > 0 ? (
                              <ul>
                                  {filteredSuppliers.map((supplier) => (
                                      <li
                                          key={supplier.id}
                                          className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                          onClick={() => {
                                              setSelectedSupplierId(supplier.id);
                                              setSupplierSearch('');
                                          }}
                                      >
                                          <p className="font-semibold text-gray-800">{supplier.name}</p>
                                          <p className="text-sm text-gray-500 font-mono">{supplier.rib}</p>
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <div className="p-3 text-center text-gray-500">
                                  Aucun fournisseur trouvé.
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}
        </FormSection>

        <FormSection title="Détails du virement">
            <div className="relative flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="express-transfer"
                  aria-describedby="express-transfer-description"
                  name="express-transfer"
                  type="checkbox"
                  checked={isExpressTransfer}
                  onChange={(e) => setIsExpressTransfer(e.target.checked)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="express-transfer" className="font-medium text-gray-700">
                  Virement Express
                </label>
                <p id="express-transfer-description" className="text-gray-500">
                  Cochez pour un traitement prioritaire de votre ordre de virement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Montant d'ordre"
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <ReadOnlyField label="Devise" value={currency} />
            </div>

            <InputField
                label="Motif"
                id="purpose"
                placeholder="Ex: Facture #2024-07-A45"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
            />
        </FormSection>
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isGenerating} className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-blue-300">
              {isGenerating ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
              )}
              <span>{isGenerating ? 'Génération...' : "Générer l'Ordre de Virement"}</span>
          </button>
        </div>
      </form>
    </>
  );
};

export default OrdreVirementForm;
