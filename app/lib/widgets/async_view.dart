import 'package:flutter/material.dart';

import 'common.dart';

/// Loads data with [load], showing a skeleton, an error with retry, or [builder].
/// Changing [reloadKey] triggers a fresh load (e.g. AppState.dataVersion).
class AsyncView<T> extends StatefulWidget {
  const AsyncView({
    super.key,
    required this.load,
    required this.builder,
    this.reloadKey,
    this.loading,
  });

  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, Future<void> Function() refresh) builder;
  final Object? reloadKey;
  final Widget? loading;

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  T? _data;
  Object? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void didUpdateWidget(covariant AsyncView<T> old) {
    super.didUpdateWidget(old);
    if (old.reloadKey != widget.reloadKey) _fetch(silent: true);
  }

  Future<void> _fetch({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final d = await widget.load();
      if (mounted) {
        setState(() {
          _data = d;
          _error = null;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e;
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_data != null) {
      return widget.builder(context, _data as T, () => _fetch(silent: true));
    }
    if (_loading) return widget.loading ?? const SkeletonList();
    return ErrorView(message: '$_error', onRetry: _fetch);
  }
}
