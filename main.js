async function translate(text, from, to, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    const { apiUrl, apiKey, model } = config;

    // 验证必要配置
    if (!apiUrl || apiUrl.trim() === '') {
        throw 'API地址不能为空，请在插件设置中填写Claude API地址（如：https://api.anthropic.com）';
    }
    if (!apiKey || apiKey.trim() === '') {
        throw 'API Key不能为空，请在插件设置中填写有效的API Key';
    }
    if (!model || model.trim() === '') {
        throw '模型名称不能为空，请填写有效的Claude模型名称（如：claude-3-5-sonnet-20241022 或 claude-3-opus-20240229）';
    }

    // 处理API地址
    let baseUrl = apiUrl.trim();
    if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }
    // 确保API地址以正确的端点结尾
    if (!baseUrl.endsWith('/v1/messages')) {
        baseUrl = baseUrl.replace(/\/$/, '') + '/v1/messages';
    }

    // 构建语言提示
    const getLanguageName = (code) => {
        const languageMap = {
            'auto': '自动检测',
            'zh': '中文',
            'zh_HANT': '繁体中文', 
            'en': '英语',
            'ja': '日语',
            'ko': '韩语',
            'fr': '法语',
            'es': '西班牙语',
            'ru': '俄语',
            'de': '德语',
            'it': '意大利语',
            'tr': '土耳其语',
            'pt': '葡萄牙语',
            'vi': '越南语',
            'id': '印尼语',
            'th': '泰语',
            'ms': '马来语',
            'ar': '阿拉伯语',
            'hi': '印地语',
            'mn': '蒙古语',
            'km': '柬埔寨语',
            'no': '挪威语',
            'fa': '波斯语',
            'nl': '荷兰语',
            'pl': '波兰语',
            'cs': '捷克语',
            'sk': '斯洛伐克语',
            'hu': '匈牙利语',
            'ro': '罗马尼亚语',
            'bg': '保加利亚语',
            'hr': '克罗地亚语',
            'sl': '斯洛文尼亚语',
            'et': '爱沙尼亚语',
            'lv': '拉脱维亚语',
            'lt': '立陶宛语',
            'fi': '芬兰语',
            'sv': '瑞典语',
            'da': '丹麦语',
            'is': '冰岛语',
            'el': '希腊语',
            'he': '希伯来语',
            'ur': '乌尔都语',
            'bn': '孟加拉语',
            'ta': '泰米尔语',
            'te': '泰卢固语',
            'ml': '马拉雅拉姆语',
            'kn': '卡纳达语',
            'gu': '古吉拉特语',
            'pa': '旁遮普语',
            'ne': '尼泊尔语',
            'si': '僧伽罗语',
            'my': '缅甸语',
            'lo': '老挝语',
            'ka': '格鲁吉亚语',
            'am': '阿姆哈拉语',
            'sw': '斯瓦希里语',
            'zu': '祖鲁语',
            'af': '南非荷兰语'
        };
        return languageMap[code] || code;
    };

    // 构建翻译提示
    let prompt;
    if (from === 'auto') {
        prompt = `请将以下文本翻译成${getLanguageName(to)}，只返回翻译结果，不要包含任何解释或其他内容：\n\n${text}`;
    } else {
        prompt = `请将以下${getLanguageName(from)}文本翻译成${getLanguageName(to)}，只返回翻译结果，不要包含任何解释或其他内容：\n\n${text}`;
    }

    // 构建请求体 - 支持Claude 4和最新模型
    const requestBody = {
        model: model.trim(),
        max_tokens: 4096,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    try {
        // 发送API请求 - 修复Body格式问题
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'anthropic-version': '2023-06-01'
            },
            body: {
                type: 'Json',
                payload: requestBody
            }
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = response.data;
                if (errorData && errorData.error && errorData.error.message) {
                    errorMessage += `: ${errorData.error.message}`;
                } else if (errorData && typeof errorData === 'string') {
                    errorMessage += `: ${errorData}`;
                }
            } catch (e) {
                // 忽略解析错误的情况
            }
            
            // 提供更友好的错误提示
            if (response.status === 400) {
                errorMessage = `请求参数错误，请检查模型名称是否正确。当前模型：${model}`;
            } else if (response.status === 401) {
                errorMessage = 'API Key无效，请检查您的API Key是否正确';
            } else if (response.status === 403) {
                errorMessage = 'API访问被拒绝，请检查您的API Key权限';
            } else if (response.status === 404) {
                errorMessage = `模型不存在或API地址错误。请检查模型名称：${model}，或验证API地址：${baseUrl}`;
            } else if (response.status === 429) {
                errorMessage = 'API请求频率超限，请稍后再试';
            } else if (response.status === 500) {
                errorMessage = 'Claude API服务器内部错误，请稍后再试';
            }
            
            throw errorMessage;
        }

        const result = response.data;
        
        // 检查响应格式
        if (!result || !result.content || !Array.isArray(result.content) || result.content.length === 0) {
            throw 'Claude API返回了意外的响应格式';
        }

        // 提取翻译结果
        const translatedText = result.content[0].text;
        if (!translatedText || translatedText.trim() === '') {
            throw 'Claude API返回了空的翻译结果';
        }

        return translatedText.trim();

    } catch (error) {
        // 处理网络错误和其他异常
        if (typeof error === 'string') {
            throw error;
        } else if (error.message) {
            if (error.message.includes('fetch')) {
                throw `网络连接失败，请检查API地址是否正确：${baseUrl}`;
            }
            throw `请求失败：${error.message}`;
        } else {
            throw `未知错误：${JSON.stringify(error)}`;
        }
    }
}
