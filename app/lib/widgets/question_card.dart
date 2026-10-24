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
      'correct' => (Icons.check_rounded, AppColors.success),
      'wrong' => (Icons.close_rounded, AppColors.danger),
      _ => (null, t.colorScheme.primary),
    };
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 30,
            child: Text('$number.',
                style: t.textTheme.titleSmall?.copyWith(color: t.colorScheme.primary, fontWeight: FontWeight.w800, height: 1.5)),
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
                      Tag(label: 'Saved', color: AppColors.primaryText(context), icon: Icons.bookmark_rounded),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: statusIcon == null ? statusColor.withValues(alpha: 0.08) : statusColor.withValues(alpha: 0.14),
              border: statusIcon == null ? Border.all(color: statusColor.withValues(alpha: 0.35), width: 1.5) : null,
            ),
            child: statusIcon == null ? null : Icon(statusIcon, color: statusColor, size: 16),
          ),
        ],
      ),
    );
  }
}
