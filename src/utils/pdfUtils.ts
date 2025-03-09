import * as pdfjsLib from 'pdfjs-dist';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFContent {
  title: string;
  content: string;
  keywords: string[];
}

export const loadPDFContent = async (pdfPath: string): Promise<PDFContent> => {
  try {
    const pdf = await pdfjsLib.getDocument(pdfPath).promise;
    let fullText = '';
    
    // Get total number of pages
    const numPages = pdf.numPages;
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }
    
    // Extract title (you might want to customize this based on your PDF structure)
    const title = pdfPath.split('/').pop()?.replace('.pdf', '') || '';
    
    // Extract keywords (you can customize this based on your needs)
    const keywords = fullText
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 20);
    
    return {
      title,
      content: fullText.trim(),
      keywords
    };
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw error;
  }
};

export const findRelevantPDFContent = (query: string, pdfContents: PDFContent[]): string | null => {
  const queryWords = query.toLowerCase().split(/\W+/);
  
  // Find the most relevant PDF based on keyword matches
  const relevantPDF = pdfContents
    .map(pdf => ({
      pdf,
      relevance: queryWords.reduce((score, word) => {
        if (pdf.content.toLowerCase().includes(word)) score += 2;
        if (pdf.keywords.includes(word)) score += 1;
        if (pdf.title.toLowerCase().includes(word)) score += 3;
        return score;
      }, 0)
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .find(item => item.relevance > 0);
    
  if (!relevantPDF) return null;
  
  // Extract relevant section from the PDF content
  const content = relevantPDF.pdf.content;
  const sentences = content.split(/[.!?]+/);
  
  // Find most relevant sentences
  const relevantSentences = sentences
    .map(sentence => ({
      sentence,
      relevance: queryWords.reduce((score, word) => {
        if (sentence.toLowerCase().includes(word)) score += 1;
        return score;
      }, 0)
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
    .map(item => item.sentence)
    .join('. ');
    
  return relevantSentences ? `${relevantSentences}.` : null;
}; 