import '../core/api_client.dart';
import '../models/models.dart';

/// Typed wrappers around the StackPrep REST API.
class Api {
  static final _c = ApiClient.instance;

  static Future<List<TrackSummary>> tracks({String? role}) async {
    final res = await _c.get('/tracks', query: {'role': role});
    return (res['tracks'] as List).map((t) => TrackSummary.fromJson(t)).toList();
  }

  static Future<TrackDetail> track(String slug) async {
    final res = await _c.get('/tracks/$slug');
    return TrackDetail.fromJson(res['track']);
  }

  static Future<({List<Question> items, int total, bool hasMore})> questions({
    String? track,
    String? topic,
    int? level,
    String? type,
    String? q,
    int page = 1,
    int limit = 30,
  }) async {
    final res = await _c.get('/questions', query: {
      'track': track,
      'topic': topic,
      'level': level,
      'type': type,
      'q': q,
      'page': page,
      'limit': limit,
    });
    return (
      items: (res['questions'] as List).map((e) => Question.fromJson(e)).toList(),
      total: (res['total'] as num).toInt(),
      hasMore: res['hasMore'] == true,
    );
  }

  static Future<Map<String, dynamic>> attemptMcq(String id, int selectedIndex) =>
      _c.post('/questions/$id/attempt', {'selectedIndex': selectedIndex});

  static Future<Map<String, dynamic>> attemptTheory(String id, bool knew) =>
      _c.post('/questions/$id/attempt', {'knew': knew});

  static Future<List<Question>> quiz({String? track, String? topic, int? level, int count = 10, String mode = 'mixed'}) async {
    final res = await _c.get('/practice/quiz', query: {
      'track': track,
      'topic': topic,
      'level': level,
      'count': count,
      'mode': mode,
    });
    return (res['questions'] as List).map((e) => Question.fromJson(e)).toList();
  }

  static Future<void> saveSession({String? track, String? topic, int? level, required int total, required int correct, required int durationSec}) =>
      _c.post('/practice/sessions', {
        'track': track,
        'topic': topic,
        'level': level,
        'total': total,
        'correct': correct,
        'durationSec': durationSec,
      });

  static Future<List<Question>> bookmarks() async {
    final res = await _c.get('/bookmarks');
    return (res['questions'] as List).map((e) => Question.fromJson(e)).toList();
  }

  static Future<bool> toggleBookmark(String questionId) async {
    final res = await _c.post('/bookmarks/$questionId');
    return res['bookmarked'] == true;
  }

  static Future<ProgressData> progress() async => ProgressData.fromJson(await _c.get('/progress'));

  static Future<void> resetProgress() => _c.delete('/users/me/progress');
}
