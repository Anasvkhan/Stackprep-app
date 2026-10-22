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
              Hero(tag: 'track-icon-${track.slug}', child: IconBox(icon: iconFor(track.icon), color: color)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(track.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 2),
                    Text(
                      '${track.questionCount} questions · ${track.topicCount} topics',
                      style: t.textTheme.bodySmall?.copyWith(color: t.hintColor),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: t.hintColor),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: ProgressBar(value: track.progress, color: color)),
              const SizedBox(width: 10),
              Text('${(track.progress * 100).round()}%',
                  style: t.textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w700, color: t.hintColor)),
            ],
          ),
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
