import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../screens/track_screen.dart';
import 'common.dart';

class TrackCard extends StatelessWidget {
  const TrackCard({super.key, required this.track, this.onReturn});
  final TrackSummary track;
  final VoidCallback? onReturn;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final color = AppColors.forTheme(context, track.color);
    return AppCard(
      onTap: () async {
        await Navigator.of(context).push(MaterialPageRoute(builder: (_) => TrackScreen(slug: track.slug, initial: track)));
        onReturn?.call();
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Hero(tag: 'track-icon-${track.slug}', child: IconBox(icon: iconFor(track.icon), color: color, size: 48)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(track.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(
                      '${track.questionCount} questions · ${track.topicCount} topics',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text('${(track.progress * 100).round()}%',
                  style: AppTheme.mono(context, size: 14, weight: FontWeight.w700, color: color)),
              Icon(Icons.chevron_right_rounded, color: AppColors.muted(context)),
            ],
          ),
          const SizedBox(height: 14),
          ProgressBar(value: track.progress, color: color, height: 6),
        ],
      ),
    );
  }
}

/// Responsive grid that lays out cards in 1-3 columns depending on width.
class ResponsiveGrid extends StatelessWidget {
  const ResponsiveGrid({super.key, required this.children, this.minItemWidth = 320, this.spacing = 12});
  final List<Widget> children;
  final double minItemWidth;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final cols = (c.maxWidth / minItemWidth).floor().clamp(1, 3);
      final w = (c.maxWidth - spacing * (cols - 1)) / cols;
      return Wrap(
        spacing: spacing,
        runSpacing: spacing,
        children: [for (final child in children) SizedBox(width: w, child: child)],
      );
    });
  }
}
