import { Router } from 'express';
import { getFullLocale, I18N_VERSION, refreshLocale } from '../services/i18n-service.js';
import { isGeminiConfigured } from '../services/gemini.js';

const router = Router();

router.get('/status', (_, res) => {
  res.json({ version: I18N_VERSION, gemini: isGeminiConfigured() });
});

router.get('/:lang', async (req, res) => {
  try {
    const refresh = req.query.refresh === '1';
    const result = refresh
      ? await refreshLocale(req.params.lang)
      : await getFullLocale(req.params.lang);
    res.json({
      lang: req.params.lang,
      version: I18N_VERSION,
      locale: result.locale,
      source: result.source,
      gemini: result.gemini,
    });
  } catch (err) {
    console.error('i18n error:', err);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

export default router;
