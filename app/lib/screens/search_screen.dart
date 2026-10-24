import 'dart:async';

import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../widgets/common.dart';
import '../widgets/question_card.dart';
import 'question_viewer_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  Timer? _debounce;
  List<Question> _results = [];
  int _total = 0;
  bool _loading = false;
  String? _error;
  String _query = '';

  static const _suggestions = [
    'load balancer', 'redis', 'kafka', 'sharding', 'CAP theorem', 'JWT', 'rate limiting',
    'event loop', 'closures', 'docker', 'kubernetes', 'indexing',
  ];

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () => _search(value));
  }

  Future<void> _search(String value) async {
    final q = value.trim();
    setState(() => _query = q);
    if (q.length < 2) {
      setState(() {
        _results = [];
        _total = 0;
        _error = null;
      });
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await Api.questions(q: q, limit: 50);
      if (!mounted || q != _query) return;
      setState(() {
        _results = res.items;
        _total = res.total;
        _error = null;
      });
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: MaxWidth(
        maxWidth: 900,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
              child: TextField(
                controller: _controller,
                autofocus: true,
                onChanged: _onChanged,
                textInputAction: TextInputAction.search,
                onSubmitted: _search,
                decoration: InputDecoration(
                  hintText: 'Search questions...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _controller.text.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () {
                            _controller.clear();
                            _search('');
                          },
                        ),
                ),
              ),
            ),
            // Always present (just hidden) so toggling loading doesn't restructure the
            // layout and recreate the TextField, which dropped typed characters.
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: Opacity(
                opacity: _loading ? 1 : 0,
                child: const LinearProgressIndicator(minHeight: 2),
              ),
            ),
            Expanded(
              child: Builder(builder: (context) {
                if (_error != null) return ErrorView(message: _error!, onRetry: () => _search(_query));
                if (_query.length < 2) {
                  return ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Row(
                        children: [
                          Icon(Icons.trending_up_rounded, size: 18, color: t.colorScheme.primary),
                          const SizedBox(width: 6),
                          Text('Popular searches', style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final s in _suggestions)
                            ActionChip(
                              label: Text(s),
                              onPressed: () {
                                _controller.text = s;
                                _search(s);
                              },
                            ),
                        ],
                      ),
                    ],
                  );
                }
                if (_results.isEmpty && !_loading) {
                  return EmptyState(
                    icon: Icons.search_off_rounded,
                    title: 'No results for "$_query"',
                    message: 'Try a shorter or different keyword.',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                  itemCount: _results.length + 1,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    if (i == 0) {
                      return Text.rich(
                        TextSpan(children: [
                          TextSpan(text: '$_total results for '),
                          TextSpan(
                            text: '\'$_query\'',
                            style: TextStyle(color: AppColors.primaryText(context), fontWeight: FontWeight.w700),
                          ),
                        ]),
                        style: AppTheme.mono(context, size: 12.5, color: AppColors.muted(context)),
                      );
                    }
                    final idx = i - 1;
                    return QuestionCard(
                      question: _results[idx],
                      number: i,
                      onTap: () async {
                        await Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => QuestionViewerScreen(questions: _results, initialIndex: idx),
                        ));
                        if (mounted) setState(() {});
                      },
                    ).entrance(idx);
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
