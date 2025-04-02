import 'dotenv/config';

class LLMBase {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
    this.defaultPrompt = "始终以Markdown格式输出。";
  }

  async sendMessage(message) {
    throw new Error(
      "sendMessage method must be implemented by subclass",
    );
  }
}

class GLM extends LLMBase {
  constructor(apiKey) {
    super(apiKey, "glm-4-air");
    this.url =
      "https://open.bigmodel.cn/api/paas/v4/chat/completions";
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
      response_format: {
        type: "json_object",
      },
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
        throw new Error(
          `Send error. Status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default class LLM {
  static LLMBase = new GLM(
    process.env.AGENTYUI_GLMTOKEN
  );
  static async executePrompt(prompt) {
    console.log(prompt);
    const data = await this.LLMBase.sendMessage(prompt);
    const response = data.choices[0].message.content;
    return response;
  }
}
