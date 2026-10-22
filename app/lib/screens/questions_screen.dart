import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../widgets/common.dart';
import '../widgets/question_card.dart';
import 'question_viewer_screen.dart';

/// Paginated, filterable list of questions for a track or topic.
class QuestionsScreen extends StatefulWidget {
  const QuestionsScreen({super.key, required this.track, this.topic, required this.title, this.initialType = 'all'});
  final String track;
  final String? topic;
  final String title;
  final String initialType;

  @override
  State<QuestionsScreen> createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  final _items = <Question>[];
  final _scroll = ScrollController();
  int? _level;
  late String _type = widget.initialType;
  int _page = 1;
  int _total = 0;
  bool _hasMore = true;
  bool _loading = false;
  String? _error;
  int _requestId = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 400) _loadMore();
    });
    _reload();
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    _requestId++;
    setState(() {
      _items.clear();
      _page = 1;
      _hasMore = true;
      _error = null;
      _loading = false;
    });
    await _loadMore();
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    final id = _requestId;
    setState(() => _loading = true);
    try {
      final res = await Api.questions(
        track: widget.track,
        topic: widget.topic,
        level: _level,
        type: _type,
        page: _page,
      );
      if (id != _requestId || !mounted) return;
      setState(() {
        _items.addAll(res.items);
        _total = res.total;
        _hasMore = res.hasMore;
        _page++;
      });
    } on ApiException catch (e) {
      if (id == _requestId && mounted) setState(() => _error = e.message);
    } finally {
      if (id == _requestId && mounted) setState(() => _loading = false);
    }
  }

  Future<void> _open(int index) async {
    await Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => QuestionViewerScreen(questions: _items, initialIndex: index),
    ));
    if (mounted) setState(() {}); // statuses/bookmarks were updated in place
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: [
          MaxWidth(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(children: [
                      _filterChip('All levels', _level == null, () => _setLevel(null)),
                      for (final l in LevelOption.all) _filterChip(l.title, _level == l.id, () => _setLevel(l.id)),
                    ]),
                  ),
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(children: [
                      _filterChip('All types', _type == 'all', () => _setType('all')),
                      _filterChip('MCQ', _type == 'mcq', () => _setType('mcq')),
                      _filterChip('Q&A + Scenario', _type == 'theory', () => _setType('theory')),
                      _filterChip('Scenario only', _type == 'scenario', () => _setType('scenario')),
                    ]),
                  ),
                  const SizedBox(height: 8),
                  Text('$_total questions', style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                ],
              ),
            ),
          ),
          Expanded(child: _buildList()),
        ],
      ),
    );
  }

  Widget _buildList() {
    if (_items.isEmpty && _loading) return const SkeletonList(height: 96);
    if (_items.isEmpty && _error != null) return ErrorView(message: _error!, onRetry: _reload);
    if (_items.isEmpty) {
      return const EmptyState(
        icon: Icons.filter_alt_off_rounded,
        title: 'No questions match these filters',
        message: 'Try another level or question type.',
      );
    }
    return RefreshIndicator(
      onRefresh: _reload,
      child: ListView.separated(
        controller: _scroll,
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
        itemCount: _items.length + (_hasMore ? 1 : 0),
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, i) {
          if (i == _items.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
            );
          }
          return MaxWidth(
            child: QuestionCard(question: _items[i], number: i + 1, onTap: () => _open(i)).entrance(i % 20),
          );
        },
      ),
    );
  }

  void _setLevel(int? l) {
    if (_level == l) return;
    _level = l;
    _reload();
  }

  void _setType(String type) {
    if (_type == type) return;
    _type = type;
    _reload();
  }

  Widget _filterChip(String label, bool selected, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ChoiceChip(label: Text(label), selected: selected, onSelected: (_) => onTap()),
      );
}
