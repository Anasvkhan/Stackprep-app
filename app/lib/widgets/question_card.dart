import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../models/models.dart';
import 'common.dart';

class QuestionCard extends StatelessWidget {
  const QuestionCard({super.key, required this.question, required this.number, required this.onTap});
  final Question question;
  final int number;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final (statusIcon, statusColor) = switch (question.status) {
      'correct' => (Icons.check_circle_rounded, AppColors.success),
      'wrong' => (Icons.cancel_rounded, AppColors.danger),
      _ => (Icons.radio_button_unchecked_rounded, t.dividerColor),
    };
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 30,
            child: Text('$number.',
                style: t.textTheme.titleSmall?.copyWith(color: t.hintColor, fontWeight: FontWeight.w700)),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  question.question,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: t.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600, height: 1.4),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    TypeBadge(question.type),
                    LevelBadge(question.level),
                    if (question.bookmarked)
                      Tag(label: 'Saved', color: t.colorScheme.primary, icon: Icons.bookmark_rounded),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Icon(statusIcon, color: statusColor, size: 22),
        ],
      ),
    );
  }
}
