import 'package:flutter/material.dart';

import '../widgets/brand.dart';
import 'bookmarks_screen.dart';
import 'explore_screen.dart';
import 'home_screen.dart';
import 'profile_screen.dart';

/// Main navigation: bottom bar on phones, navigation rail on wide screens.
class Shell extends StatefulWidget {
  const Shell({super.key});

  static void goToTab(BuildContext context, int index) =>
      context.findAncestorStateOfType<_ShellState>()?._select(index);

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int _index = 0;

  static const _destinations = [
    (Icons.home_outlined, Icons.home_rounded, 'Home'),
    (Icons.explore_outlined, Icons.explore_rounded, 'Explore'),
    (Icons.bookmark_outline_rounded, Icons.bookmark_rounded, 'Saved'),
    (Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
  ];

  final _pages = const [HomeScreen(), ExploreScreen(), BookmarksScreen(), ProfileScreen()];

  void _select(int i) => setState(() => _index = i);

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 900;
    // Only the visible tab takes part in Hero animations: Home and Explore both
    // show the same track cards, and duplicate Hero tags break route transitions.
    final body = IndexedStack(
      index: _index,
      children: [for (var i = 0; i < _pages.length; i++) HeroMode(enabled: i == _index, child: _pages[i])],
    );

    if (wide) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: _index,
              onDestinationSelected: _select,
              labelType: NavigationRailLabelType.all,
              leading: const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: BrandMark(size: 40)),
              destinations: [
                for (final d in _destinations)
                  NavigationRailDestination(icon: Icon(d.$1), selectedIcon: Icon(d.$2), label: Text(d.$3)),
              ],
            ),
            VerticalDivider(width: 1, color: Theme.of(context).dividerColor),
            Expanded(child: body),
          ],
        ),
      );
    }

    return Scaffold(
      body: body,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
          boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.03), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _select,
          destinations: [
            for (final d in _destinations)
              NavigationDestination(icon: Icon(d.$1), selectedIcon: Icon(d.$2), label: d.$3),
          ],
        ),
      ),
    );
  }
}
