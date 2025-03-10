'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFContent, loadPDFContent, findRelevantPDFContent } from '../utils/pdfUtils';
import Image from 'next/image';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  image?: {
    src: string;
    alt: string;
  };
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm Digital Bob, your AI assistant. I can tell you about Bob's professional experience, technical leadership, achievements, family, and personal interests. I can also provide information from my PDF documents. What would you like to know?",
      sender: 'bot',
      image: {
        src: '/images/bob-professional.jpg',
        alt: 'Bob Hackney - Professional Headshot'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [pdfContents, setPdfContents] = useState<PDFContent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PDF contents when component mounts
    const loadPDFs = async () => {
      try {
        // Add your PDF files here
        const pdfPaths = [
          '/pdfs/resume.pdf',
          '/pdfs/publications.pdf',
          '/pdfs/Hackney, Bob - Behavioral Report.pdf'
        ];

        const contents = await Promise.all(
          pdfPaths.map(path => loadPDFContent(path))
        );
        setPdfContents(contents);
      } catch (error) {
        console.error('Error loading PDFs:', error);
      }
    };

    loadPDFs();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Check PDF content first for behavior-related queries
    if (input.includes('behavior') || input.includes('personality') || input.includes('style') || input.includes('assessment')) {
      const pdfResponse = findRelevantPDFContent(input, pdfContents);
      if (pdfResponse) {
        return {
          text: pdfResponse,
          sender: 'bot',
          image: {
            src: '/images/bob-leadership.jpg',
            alt: 'Bob Hackney - Leadership Style'
          }
        };
      }
    }

    if (input.includes('experience') || input.includes('background') || input.includes('work')) {
      return {
        text: "I have over 25 years of Technology leadership experience. Currently, I'm the CTO of Perfectserve, a leading healthcare communication and scheduling platform. In my first year, we achieved a 78% gross margin and improved Adj. EBITDA to 39%, enabling the largest ARR growth in company history of $14M. Previously at SitusAMC, I led digital transformation initiatives that reduced IT operating costs by $1.9M in six months. At DaVita, I managed a $64M project portfolio and implemented innovative healthcare technology solutions.",
        sender: 'bot',
        image: {
          src: '/images/bob-work.jpg',
          alt: 'Bob Hackney at Work'
        }
      };
    }
    
    if (input.includes('current') || input.includes('perfectserve') || input.includes('role')) {
      return {
        text: "As CTO of Perfectserve, I lead the development of our comprehensive healthcare communication platform, PerfectServe Unite. Our platform includes five integrated solutions: clinical communication & collaboration, provider scheduling (Lightning Bolt), medical answering service, healthcare operator console, and patient engagement. We're recognized as a Leader in the Gartner Magic Quadrant, offering HIPAA-compliant solutions with Dynamic Intelligent Routing® technology. Under my leadership, we've achieved significant improvements: increasing R&D velocity by 133% through strategic offshore staffing (73% of team), achieving 78% gross margin (exceeding 77% forecast), improving Adj. EBITDA to 39% (1% over forecast), and enabling record-breaking ARR growth of $14M. We integrate with 250+ healthcare systems and focus on improving patient care while reducing clinician burnout.",
        sender: 'bot',
        image: {
          src: '/images/Perfectserve-tech-team.jpeg',
          alt: 'Bob Hackney with Perfectserve Tech Team'
        }
      };
    }

    if (input.includes('company') || input.includes('perfectserve') || input.includes('products')) {
      return {
        text: "Perfectserve is a leading healthcare technology company that provides the most advanced communication and scheduling platform in healthcare. Our flagship product, PerfectServe Unite, includes five key solutions: 1) Clinical Communication & Collaboration - a HIPAA-compliant platform with Dynamic Intelligent Routing®, 2) Provider Scheduling through our Lightning Bolt solution, which optimizes schedules to reduce physician burnout, 3) Medical Answering Service with automated routing, 4) Healthcare Operator Console for efficient call management, and 5) Patient Engagement tools that require no app installation. We serve major healthcare organizations like Hospital for Special Surgery (NY) and Ochsner Health, with over 250 integrations including EHRs, schedules, directory services, and more.",
        sender: 'bot',
        image: {
          src: '/images/bob-company.jpg',
          alt: 'Perfectserve'
        }
      };
    }
    
    if (input.includes('achievements') || input.includes('accomplishments')) {
      return {
        text: "Throughout my career, I've driven significant improvements across organizations. Key achievements include: reducing IT operating costs by $1.9M in six months at SitusAMC, growing DaVita's Project Portfolio from $5M to $64M, reducing SaaS application time-to-cash from 12 to 3 months, establishing DevOps practices across multiple service areas, leading SOX compliance for 13 years in telecom, and implementing NIST SP 800-53 Rev. 5 security frameworks. I've also successfully managed international programs across 8 countries.",
        sender: 'bot',
        image: {
          src: '/images/bob-achievements.jpg',
          alt: 'Bob Hackney - Achievements'
        }
      };
    }
    
    if (input.includes('military') || input.includes('marine') || input.includes('service')) {
      return {
        text: "My journey began as a United States Marine, where I learned invaluable lessons about leadership, discipline, and teamwork. This experience shaped my leadership philosophy of empowering others and maintaining high standards of excellence. The Marine Corps' values of honor, courage, and commitment continue to guide my approach to technology leadership and team building. I'm proud to bring these military principles to the corporate world, especially in fostering resilient and collaborative teams.",
        sender: 'bot',
        image: {
          src: '/images/bob-military.jpg',
          alt: 'Bob Hackney - Military Service'
        }
      };
    }
    
    if (input.includes('skills') || input.includes('expertise') || input.includes('technical')) {
      return {
        text: "My technical expertise spans multiple domains: DevOps implementation and automation, cloud architecture (especially AWS), security frameworks (NIST SP 800-53 Rev. 5), clinical systems transformation, telecom systems (WIN/Camel II, IS-41EE), and enterprise infrastructure management. I specialize in digital transformation, having led major initiatives in healthcare IT, financial services, and telecommunications. I'm particularly skilled in implementing agile methodologies, CI/CD pipelines, and cloud-native architectures while maintaining robust security controls.",
        sender: 'bot',
        image: {
          src: '/images/bob-skills.jpg',
          alt: 'Bob Hackney - Skills'
        }
      };
    }
    
    if (input.includes('leadership') || input.includes('management') || input.includes('style')) {
      return {
        text: "My leadership philosophy is built on three core principles: empowerment, innovation, and continuous improvement. I believe in creating an environment where team members can grow and excel, while maintaining high standards of technical excellence. I focus on building supportive, family-like work cultures that foster innovation and operational efficiency. This approach has consistently resulted in high-performing teams and successful digital transformations. I emphasize mentorship, clear communication, and data-driven decision-making.",
        sender: 'bot',
        image: {
          src: '/images/bob-leadership.jpg',
          alt: 'Bob Hackney - Leadership Style'
        }
      };
    }
    
    if (input.includes('security') || input.includes('compliance')) {
      return {
        text: "Security and compliance are fundamental to my technical leadership approach. I've developed comprehensive security programs including: implementing 'SCP' (Secure Contain Protect) methodology for AWS security, creating strategic security roadmaps aligned with NIST SP 800-53 Rev. 5, leading SOX compliance initiatives, and establishing robust security protocols for healthcare data protection. I believe in building security into the development process from the ground up, rather than treating it as an afterthought.",
        sender: 'bot',
        image: {
          src: '/images/bob-security.jpg',
          alt: 'Bob Hackney - Security'
        }
      };
    }

    if (input.includes('team') || input.includes('engineers') || input.includes('developers') || input.includes('staff')) {
      return {
        text: "I'm incredibly proud of our talented technology team at Perfectserve. Through strategic offshore staffing, we've built a highly efficient team that's 73% offshore, leading to a 133% increase in R&D velocity. Our team is focused on innovation, quality, and delivering solutions that make a real difference in healthcare communication. We maintain high standards while fostering a collaborative, supportive environment where every team member can grow and contribute meaningfully to our mission.",
        sender: 'bot',
        image: {
          src: '/images/Perfectserve-tech-team.jpeg',
          alt: 'Bob Hackney with Perfectserve Tech Team'
        }
      };
    }

    if (input.includes('healthcare') || input.includes('medical') || input.includes('health')) {
      return {
        text: "My experience in healthcare technology is extensive, spanning both provider and software perspectives. At Perfectserve, I'm leading the development of innovative healthcare communication solutions. At DaVita, I managed clinical systems transformation projects and implemented technology solutions that improved patient care delivery. I understand the unique challenges of healthcare IT, including regulatory compliance (HIPAA), interoperability standards (HL7/FHIR), and the critical nature of healthcare systems.",
        sender: 'bot',
        image: {
          src: '/images/bob-healthcare.jpg',
          alt: 'Bob Hackney - Healthcare'
        }
      };
    }

    if (input.includes('transformation') || input.includes('change') || input.includes('modernization')) {
      return {
        text: "Digital transformation has been a constant theme in my career. I specialize in modernizing legacy systems, implementing cloud solutions, and optimizing business processes. Notable transformations include: modernizing healthcare communication platforms at Perfectserve, implementing cloud-native solutions at SitusAMC, and leading DaVita's clinical systems transformation. I focus on both technical excellence and change management to ensure successful transformations.",
        sender: 'bot',
        image: {
          src: '/images/bob-transformation.jpg',
          alt: 'Bob Hackney - Digital Transformation'
        }
      };
    }

    if (input.includes('family') || input.includes('wife') || input.includes('kids') || input.includes('children')) {
      return {
        text: "I'm blessed with an amazing family! My wonderful wife Dawn is the cornerstone of our family, and together we have five incredible children. Mel, our eldest, followed by Greg, Robby, Hannah, and Nathan. Each of them brings their own unique talents and joy to our family. They're the reason I strive to maintain a healthy work-life balance and why I emphasize creating supportive, family-like cultures in my professional teams.",
        sender: 'bot',
        image: {
          src: '/images/bob-family.jpg',
          alt: 'Bob Hackney with Family'
        }
      };
    }

    if (input.includes('dawn') || input.includes('spouse') || input.includes('wife')) {
      return {
        text: "My wife Dawn is truly amazing - she's the heart of our family and my biggest supporter. Her strength and dedication have been instrumental in both our family life and my career journey. She's an incredible partner who helps maintain our strong family bonds while I pursue technological innovations in healthcare.",
        sender: 'bot',
        image: {
          src: '/images/bob-dawn.jpeg',
          alt: 'Bob Hackney with Dawn'
        }
      };
    }

    if (input.includes('mel') || input.includes('greg') || input.includes('robby') || input.includes('hannah') || input.includes('nathan')) {
      return {
        text: "I'm incredibly proud of all my children - Mel, Greg, Robby, Hannah, and Nathan. Each of them has their own unique path and talents, and watching them grow and achieve their goals has been one of my greatest joys. They've taught me as much about leadership and personal growth as any professional experience.",
        sender: 'bot',
        image: {
          src: '/images/bob-children.jpg',
          alt: 'Bob Hackney with Children'
        }
      };
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return {
        text: "Hello! I'm Digital Bob, and I'm here to share insights about my experience as a technology leader, my amazing family, my current role as CTO of Perfectserve, my background in healthcare and financial services, my military service, or my approach to leadership and technology. What interests you most?",
        sender: 'bot',
        image: {
          src: '/images/bob-greeting.jpg',
          alt: 'Bob Hackney - Greeting'
        }
      };
    }

    // Add a response about PDF capabilities
    if (input.includes('pdf') || input.includes('document') || input.includes('resume') || input.includes('publication')) {
      return {
        text: "I can access and provide information from various PDF documents, including resumes, publications, and other materials. What specific information are you looking for?",
        sender: 'bot',
        image: {
          src: '/images/bob-pdf.jpg',
          alt: 'Bob Hackney - PDF Capabilities'
        }
      };
    }

    return {
      text: "I can tell you about my experience as CTO of Perfectserve, our healthcare communication platform, technical leadership, military service, healthcare expertise, digital transformation initiatives, my wonderful family, or specific achievements. I also have insights about security, compliance, and team leadership. What would you like to learn more about?",
      sender: 'bot',
      image: {
        src: '/images/cold-bob.jpeg',
        alt: 'Bob Hackney - Professional'
      }
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user'
    };

    const botMessage = getBotResponse(input);

    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-blue-50">
        <div className="h-[400px] overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-4 rounded-lg max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                {message.text}
                {message.image && (
                  <div className="mt-2">
                    <Image
                      src={message.image.src}
                      alt={message.image.alt}
                      width={300}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
            placeholder="Ask me anything about Bob's experience..."
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 