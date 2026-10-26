import os
import weasyprint

def build_pdf():
    html_file = '/home/deepak-r/Project/CODEX/Inkloom_AI_Round_1_Plan_AegisBrand.html'
    pdf_file = '/home/deepak-r/Project/CODEX/Inkloom_AI_Round_1_Plan_AegisBrand.pdf'
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"Reading HTML template from: {html_file}")
    doc = weasyprint.HTML(string=html_content).render()
    print(f"Rendered pages: {len(doc.pages)}")
    doc.write_pdf(pdf_file)
    print(f"PDF saved to: {pdf_file} (Size: {os.path.getsize(pdf_file)} bytes)")

if __name__ == '__main__':
    build_pdf()
