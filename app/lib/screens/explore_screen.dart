import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/common.dart';
import '../widgets/track_card.dart';
import 'search_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  bool _allTracks = false;
  String _category = 'all';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final t = Theme.of(context);
    final categories = state.categories;

    return Scaffold(
      appBar: AppBar(title: const Text('Explore')),
      body: SafeArea(
        top: false,
        child: AsyncView<List<TrackSummary>>(
          reloadKey: '${state.dataVersion}-$_allTracks-${state.user?.role}',
          load: () => Api.tracks(role: _allTracks ? 'all' : null),
          builder: (context, tracks, refresh) {
            final visible = _category == 'all' ? tracks : tracks.where((x) => x.category == _category).toList();
            final groups = <CategoryOption, List<TrackSummary>>{};
            for (final c in categories) {
              final items = visible.where((x) => x.category == c.id).toList();
              if (items.isNotEmpty) groups[c] = items;
            }
            final available = categories.where((c) => tracks.any((x) => x.category == c.id)).toList();
            var index = 0;

            return RefreshIndicator(
              onRefresh: refresh,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                children: [
                  MaxWidth(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Search field (opens the search screen)
                        Pressable(
                          onTap: () =>
                              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SearchScreen())),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                            decoration: BoxDecoration(
                              color: t.cardColor,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: t.dividerColor),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.search_rounded, color: t.hintColor),
                                const SizedBox(width: 10),
                                Text('Search any question, e.g. "kafka"', style: TextStyle(color: t.hintColor)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        SegmentedButton<bool>(
                          showSelectedIcon: false,
                          segments: [
                            const ButtonSegment(value: false, label: Text('My stack')),
                            const ButtonSegment(value: true, label: Text('All tracks')),
                          ],
                          selected: {_allTracks},
                          onSelectionChanged: (s) => setState(() {
                            _allTracks = s.first;
                            _category = 'all';
                          }),
                        ),
                        const SizedBox(height: 12),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _chip('All', 'all'),
                              for (final c in available) _chip(c.title, c.id),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (groups.isEmpty)
                          const EmptyState(icon: Icons.search_off_rounded, title: 'No tracks in this category')
                        else
                          for (final entry in groups.entries) ...[
                            SectionHeader('${entry.key.title}  ·  ${entry.value.length}'),
                            ResponsiveGrid(children: [
                              for (final tr in entry.value) TrackCard(track: tr, onReturn: refresh).entrance(index++),
                            ]),
                            const SizedBox(height: 24),
                          ],
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _chip(String label, String id) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ChoiceChip(
          label: Text(label),
          selected: _category == id,
          onSelected: (_) => setState(() => _category = id),
        ),
      );
}
