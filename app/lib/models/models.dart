int _int(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;

/// Designations. Kept in sync with ROLES in backend/src/config/constants.js;
/// bundled in the app so onboarding never waits for the server.
class RoleOption {
  const RoleOption({required this.id, required this.title, required this.icon});
  final String id;
  final String title;
  final String icon;

  static const all = [
    RoleOption(id: 'frontend', title: 'Frontend Developer', icon: 'web'),
    RoleOption(id: 'backend', title: 'Backend Developer', icon: 'dns'),
    RoleOption(id: 'fullstack', title: 'Full Stack Developer', icon: 'layers'),
    RoleOption(id: 'software-engineer', title: 'Software Engineer', icon: 'code'),
    RoleOption(id: 'mobile', title: 'Mobile Developer', icon: 'smartphone'),
    RoleOption(id: 'devops', title: 'DevOps / Cloud Engineer', icon: 'cloud'),
  ];
}

class LevelOption {
  const LevelOption(this.id, this.title, this.subtitle);
  final int id;
  final String title;
  final String subtitle;

  static const all = [
    LevelOption(1, 'Junior', '0 - 2 years'),
    LevelOption(2, 'Mid Level', '2 - 5 years'),
    LevelOption(3, 'Senior', '5+ years'),
  ];

  static String name(int level) => switch (level) { 1 => 'Junior', 2 => 'Mid', 3 => 'Senior', _ => 'All' };
}

/// Track categories. Kept in sync with CATEGORIES in backend/src/config/constants.js.
class CategoryOption {
  const CategoryOption({required this.id, required this.title});
  final String id;
  final String title;

  static const all = [
    CategoryOption(id: 'system-design', title: 'System Design'),
    CategoryOption(id: 'languages', title: 'Languages'),
    CategoryOption(id: 'frameworks', title: 'Frameworks'),
    CategoryOption(id: 'databases', title: 'Databases'),
    CategoryOption(id: 'devops', title: 'DevOps & Cloud'),
    CategoryOption(id: 'fundamentals', title: 'CS Fundamentals'),
  ];
}

class Streak {
  Streak({this.current = 0, this.best = 0});
  final int current;
  final int best;

  factory Streak.fromJson(Map<String, dynamic>? j) =>
      Streak(current: _int(j?['current']), best: _int(j?['best']));
}

class AppUser {
  AppUser({
    required this.id,
    required this.name,
    this.email,
    this.role,
    required this.level,
    required this.streak,
  });

  final String id;
  final String name;
  final String? email;
  final String? role;
  final int level;
  final Streak streak;

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: j['_id'] ?? j['id'] ?? '',
        name: j['name'] ?? '',
        email: j['email'],
        role: j['role'],
        level: _int(j['level']) == 0 ? 1 : _int(j['level']),
        streak: Streak.fromJson(j['streak']),
      );
}

class TrackSummary {
  TrackSummary({
    required this.slug,
    required this.title,
    this.subtitle,
    this.description,
    required this.category,
    required this.icon,
    required this.color,
    required this.topicCount,
    required this.questionCount,
    required this.mcqCount,
    required this.attempted,
    required this.correct,
  });

  final String slug;
  final String title;
  final String? subtitle;
  final String? description;
  final String category;
  final String icon;
  final String? color;
  final int topicCount;
  final int questionCount;
  final int mcqCount;
  final int attempted;
  final int correct;

  double get progress => questionCount == 0 ? 0 : (attempted / questionCount).clamp(0, 1).toDouble();

  factory TrackSummary.fromJson(Map<String, dynamic> j) => TrackSummary(
        slug: j['slug'],
        title: j['title'],
        subtitle: j['subtitle'],
        description: j['description'],
        category: j['category'] ?? '',
        icon: j['icon'] ?? 'code',
        color: j['color'],
        topicCount: _int(j['topicCount'] ?? (j['topics'] as List?)?.length),
        questionCount: _int(j['questionCount']),
        mcqCount: _int(j['mcqCount']),
        attempted: _int(j['attempted']),
        correct: _int(j['correct']),
      );
}

class Topic {
  Topic({
    required this.slug,
    required this.title,
    required this.questionCount,
    required this.mcqCount,
    required this.levels,
    required this.attempted,
    required this.correct,
  });

  final String slug;
  final String title;
  final int questionCount;
  final int mcqCount;
  final Map<int, int> levels;
  final int attempted;
  final int correct;

  double get progress => questionCount == 0 ? 0 : (attempted / questionCount).clamp(0, 1).toDouble();

  factory Topic.fromJson(Map<String, dynamic> j) {
    final lv = (j['levels'] as Map?) ?? {};
    return Topic(
      slug: j['slug'],
      title: j['title'],
      questionCount: _int(j['questionCount']),
      mcqCount: _int(j['mcqCount']),
      levels: {1: _int(lv['1']), 2: _int(lv['2']), 3: _int(lv['3'])},
      attempted: _int(j['attempted']),
      correct: _int(j['correct']),
    );
  }
}

class TrackDetail {
  TrackDetail({required this.summary, required this.topics});
  final TrackSummary summary;
  final List<Topic> topics;

  factory TrackDetail.fromJson(Map<String, dynamic> j) => TrackDetail(
        summary: TrackSummary.fromJson(j),
        topics: ((j['topics'] as List?) ?? []).map((t) => Topic.fromJson(t)).toList(),
      );
}

class Question {
  Question({
    required this.id,
    required this.track,
    required this.topic,
    required this.type,
    required this.level,
    required this.question,
    this.code,
    required this.options,
    this.correctIndex,
    required this.answer,
    this.bookmarked = false,
    this.status = 'new',
  });

  final String id;
  final String track;
  final String topic;
  final String type; // mcq | qa | scenario
  final int level;
  final String question;
  final String? code;
  final List<String> options;
  final int? correctIndex;
  final String answer;
  bool bookmarked;
  String status; // new | correct | wrong

  bool get isMcq => type == 'mcq';

  String get typeLabel => switch (type) { 'mcq' => 'MCQ', 'scenario' => 'Scenario', _ => 'Q&A' };

  factory Question.fromJson(Map<String, dynamic> j) => Question(
        id: j['id'] ?? j['_id'],
        track: j['track'] ?? '',
        topic: j['topic'] ?? '',
        type: j['type'] ?? 'qa',
        level: _int(j['level']),
        question: j['question'] ?? '',
        code: j['code'],
        options: ((j['options'] as List?) ?? []).map((e) => '$e').toList(),
        correctIndex: j['correctIndex'] == null ? null : _int(j['correctIndex']),
        answer: j['answer'] ?? '',
        bookmarked: j['bookmarked'] == true,
        status: j['status'] ?? 'new',
      );
}

class TrackProgress {
  TrackProgress({
    required this.slug,
    required this.title,
    required this.icon,
    this.color,
    required this.total,
    required this.attempted,
    required this.correct,
  });

  final String slug;
  final String title;
  final String icon;
  final String? color;
  final int total;
  final int attempted;
  final int correct;

  double get progress => total == 0 ? 0 : (attempted / total).clamp(0, 1).toDouble();
  int get accuracy => attempted == 0 ? 0 : ((correct / attempted) * 100).round();

  factory TrackProgress.fromJson(Map<String, dynamic> j) => TrackProgress(
        slug: j['slug'],
        title: j['title'],
        icon: j['icon'] ?? 'code',
        color: j['color'],
        total: _int(j['total']),
        attempted: _int(j['attempted']),
        correct: _int(j['correct']),
      );
}

class SessionSummary {
  SessionSummary({
    required this.trackTitle,
    required this.total,
    required this.correct,
    required this.durationSec,
    required this.createdAt,
  });

  final String trackTitle;
  final int total;
  final int correct;
  final int durationSec;
  final DateTime createdAt;

  factory SessionSummary.fromJson(Map<String, dynamic> j) => SessionSummary(
        trackTitle: j['trackTitle'] ?? 'Practice',
        total: _int(j['total']),
        correct: _int(j['correct']),
        durationSec: _int(j['durationSec']),
        createdAt: DateTime.tryParse(j['createdAt'] ?? '')?.toLocal() ?? DateTime.now(),
      );
}

class ProgressData {
  ProgressData({
    required this.attempted,
    required this.correct,
    required this.accuracy,
    required this.quizzes,
    required this.bookmarks,
    required this.streak,
    required this.tracks,
    required this.recentSessions,
  });

  final int attempted;
  final int correct;
  final int accuracy;
  final int quizzes;
  final int bookmarks;
  final Streak streak;
  final List<TrackProgress> tracks;
  final List<SessionSummary> recentSessions;

  factory ProgressData.fromJson(Map<String, dynamic> j) {
    final o = (j['overall'] as Map<String, dynamic>?) ?? {};
    return ProgressData(
      attempted: _int(o['attempted']),
      correct: _int(o['correct']),
      accuracy: _int(o['accuracy']),
      quizzes: _int(o['quizzes']),
      bookmarks: _int(o['bookmarks']),
      streak: Streak.fromJson(j['streak']),
      tracks: ((j['tracks'] as List?) ?? []).map((t) => TrackProgress.fromJson(t)).toList(),
      recentSessions: ((j['recentSessions'] as List?) ?? []).map((s) => SessionSummary.fromJson(s)).toList(),
    );
  }
}
