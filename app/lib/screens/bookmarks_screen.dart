import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import '../widgets/question_card.dart';
import 'question_viewer_screen.dart';
import 'shell.dart';

class BookmarksScreen extends StatelessWidget {
  const BookmarksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final version = context.select<AppState, int>((s) => s.dataVersion);
    return Scaffold(
      appBar: const BrandAppBar(subtitle: 'Saved'),
      body: AsyncView<List<Question>>(
        reloadKey: version,
        load: Api.bookmarks,
        builder: (context, items, refresh) {
          if (items.isEmpty) {
            return EmptyState(
              icon: Icons.bookmark_add_outlined,
              title: 'No saved questions yet',
              message: 'Tap the bookmark icon on any question to save it here for quick revision.',
              action: 'Explore tracks',
              actionIcon: Icons.explore_outlined,
              onAction: () => Shell.goToTab(context, 1),
            );
          }
          return RefreshIndicator(
            onRefresh: refresh,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
              itemCount: items.length + 1,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                if (i == 0) return MaxWidth(child: _Header(count: items.length));
                final idx = i - 1;
                return MaxWidth(
                  child: QuestionCard(
                    question: items[idx],
                    number: i,
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => QuestionViewerScreen(questions: items, initialIndex: idx),
                    )),
                  ).entrance(idx),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Saved questions',
                    style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                Text('Your personal review desk',
                    style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context))),
              ],
            ),
          ),
          CountPill('$count saved'.toUpperCase(), icon: Icons.bookmark_rounded),
        ],
      ),
    );
  }
}
