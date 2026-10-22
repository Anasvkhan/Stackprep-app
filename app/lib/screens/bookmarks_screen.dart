import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
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
      appBar: AppBar(title: const Text('Saved questions')),
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
              onAction: () => Shell.goToTab(context, 1),
            );
          }
          return RefreshIndicator(
            onRefresh: refresh,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) => MaxWidth(
                child: QuestionCard(
                  question: items[i],
                  number: i + 1,
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => QuestionViewerScreen(questions: items, initialIndex: i),
                  )),
                ).entrance(i),
              ),
            ),
          );
        },
      ),
    );
  }
}
