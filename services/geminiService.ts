import { GoogleGenAI } from "@google/genai";
import { Order, Product } from '../types';

const getClient = () => {
  // Ưu tiên sử dụng biến môi trường, nếu không có thì dùng key hardcode (theo yêu cầu user)
  const apiKey = process.env.API_KEY || 'AIzaSyCAsqTRelkmV_lvmo8UE2nXL2oAuRO8OXA';
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBusinessData = async (
  orders: Order[], 
  products: Product[], 
  prompt: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare a summary of data to avoid exceeding token limits if data is huge
    // For a real app, you might want to summarize this more aggressively
    const dataContext = `
      Dữ liệu hệ thống bán hàng hiện tại:
      
      Danh sách sản phẩm (Top 5):
      ${JSON.stringify(products.slice(0, 5))}
      
      Danh sách đơn hàng gần đây (Top 5):
      ${JSON.stringify(orders.slice(0, 5))}
      
      Tổng số đơn hàng: ${orders.length}
      Tổng số sản phẩm: ${products.length}
    `;

    const systemInstruction = `Bạn là một trợ lý ảo AI thông minh chuyên về quản lý bán hàng và phân tích kinh doanh (Sales Management Assistant).
    Nhiệm vụ của bạn là giúp chủ cửa hàng phân tích dữ liệu, viết email cho khách hàng, hoặc gợi ý chiến lược bán hàng.
    Hãy trả lời bằng tiếng Việt chuyên nghiệp, ngắn gọn và súc tích.
    Dữ liệu được cung cấp dưới dạng JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Dựa trên dữ liệu sau:\n${dataContext}\n\nYêu cầu của người dùng: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
  }
};