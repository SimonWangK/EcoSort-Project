import { classifyWasteImageWithVisionApi, formatVisionConfidence } from '../../services/visionRecognitionService';

const originalFetch = global.fetch;

describe('visionRecognitionService', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_VISION_API_ENDPOINT = 'https://vision.example.test/classify-waste';
    delete process.env.EXPO_PUBLIC_VISION_API_TOKEN;
    delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
    delete process.env.EXPO_PUBLIC_HF_API_BASE;
    delete process.env.EXPO_PUBLIC_HF_MODEL_IDS;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_VISION_API_ENDPOINT;
    delete process.env.EXPO_PUBLIC_VISION_API_TOKEN;
    delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
    delete process.env.EXPO_PUBLIC_HF_API_BASE;
    delete process.env.EXPO_PUBLIC_HF_MODEL_IDS;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('throws a useful error when neither proxy endpoint nor direct token is configured', async () => {
    delete process.env.EXPO_PUBLIC_VISION_API_ENDPOINT;

    await expect(
      classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' }),
    ).rejects.toThrow('Photo check is not available');
  });

  test('calls configured proxy endpoint and maps detected item to council rule', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        item: 'coffee cup',
        category: 'packaging',
        confidence: 0.88,
        labels: ['cup', 'takeaway cup'],
        provider: 'Hugging Face test model',
      }),
    });

    const result = await classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://vision.example.test/classify-waste',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.prediction.item).toBe('coffee cup');
    expect(result.rule?.item).toBe('coffee cup');
    expect(result.rule?.council).toBe('Yarra Council');
  });

  test('passes optional proxy token as bearer authorization', async () => {
    process.env.EXPO_PUBLIC_VISION_API_TOKEN = 'proxy-token';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ item: 'battery', confidence: 92, labels: [] }),
    });

    await classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer proxy-token' }),
      }),
    );
  });

  test('can call Hugging Face directly when no proxy endpoint is configured', async () => {
    delete process.env.EXPO_PUBLIC_VISION_API_ENDPOINT;
    process.env.EXPO_PUBLIC_HF_API_TOKEN = 'hf_test_token';
    process.env.EXPO_PUBLIC_HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';
    process.env.EXPO_PUBLIC_HF_MODEL_IDS = 'google/vit-base-patch16-224';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify([
        { label: 'water bottle', score: 0.81 },
        { label: 'wine bottle', score: 0.1 },
      ]),
    });

    const result = await classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer hf_test_token', 'Content-Type': 'image/jpeg' }),
      }),
    );
    expect(result.prediction.item).toBe('plastic bottle');
    expect(result.rule?.item).toBe('plastic bottle');
  });

  test('returns null rule when the vision item has no matching council guidance', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ item: 'ceramic mug', confidence: 0.79, labels: ['mug'] }),
    });

    const result = await classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' });

    expect(result.prediction.item).toBe('ceramic mug');
    expect(result.rule).toBeNull();
  });

  test('normalises percentage confidence from API responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ item: 'battery', confidence: 91, labels: [] }),
    });

    const result = await classifyWasteImageWithVisionApi({ imageBase64: 'abc123', council: 'Yarra Council' });

    expect(result.prediction.confidence).toBeCloseTo(0.91);
  });

  test('formatVisionConfidence displays friendly confidence text', () => {
    expect(formatVisionConfidence(0.864)).toBe('86%');
    expect(formatVisionConfidence(0)).toBe('not enough detail');
  });
});
