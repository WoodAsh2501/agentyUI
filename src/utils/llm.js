
class LLMModel {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
    this.defaultPrompt = "始终以Json格式输出。";
  }

  async sendMessage(message) {
    throw new Error("sendMessage method must be implemented by subclass");
  }
}

class GLM extends LLMModel {
  constructor(apiKey) {
    super(apiKey, "glm-4");
    this.url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  }

  async sendMessage(prompt) {
    const payload = {
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Send error. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default class LLM {
  static LLMModel = new GLM(
    import.meta.env.VITE_AGENTUI_GLMTOKEN
  );
  static async executePrompt(
    systemPrompt = this.defaultPrompt,
    userInput = null,
    originalData = null
  ) {
    const prompt = systemPrompt + userInput + originalData;

    console.log('Sending to llm:', {
      msg: prompt
    })
    const data = await this.LLMModel.sendMessage(prompt);
    const response = data.choices[0].message.content;
    return response;
  }
}
