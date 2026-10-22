import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';

import '../core/theme.dart';

/// Renders answers/explanations. Code blocks and wide tables scroll horizontally.
class MarkdownView extends StatelessWidget {
  const MarkdownView(this.data, {super.key, this.fontSize = 15});
  final String data;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final isDark = t.brightness == Brightness.dark;
    final codeBg = isDark ? const Color(0xFF0E0E16) : const Color(0xFFF1F0FA);
    final body = t.textTheme.bodyMedium?.copyWith(fontSize: fontSize, height: 1.6);

    return MarkdownBody(
      data: data,
      selectable: true,
      styleSheet: MarkdownStyleSheet.fromTheme(t).copyWith(
        p: body,
        listBullet: body,
        h1: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        h2: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        h3: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
        strong: const TextStyle(fontWeight: FontWeight.w800),
        code: AppTheme.mono(context, size: fontSize - 1.5).copyWith(
          backgroundColor: codeBg,
          color: isDark ? const Color(0xFFB9AFFF) : AppColors.primaryDark,
        ),
        codeblockDecoration: BoxDecoration(
          color: codeBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: t.dividerColor),
        ),
        codeblockPadding: const EdgeInsets.all(14),
        blockquoteDecoration: BoxDecoration(
          color: t.colorScheme.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border(left: BorderSide(color: t.colorScheme.primary, width: 3)),
        ),
        tableHead: body?.copyWith(fontWeight: FontWeight.w800, fontSize: fontSize - 1),
        tableBody: body?.copyWith(fontSize: fontSize - 1),
        tableBorder: TableBorder.all(color: t.dividerColor),
        tableCellsPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        tableColumnWidth: const FlexColumnWidth(),
        tableHeadAlign: TextAlign.left,
      ),
    );
  }
}

/// Code snippet attached to a question.
class CodeBlock extends StatelessWidget {
  const CodeBlock(this.code, {super.key});
  final String code;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0E0E16) : const Color(0xFF1E1E2E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        child: SelectableText(
          code,
          style: AppTheme.mono(context, size: 13.5).copyWith(color: const Color(0xFFE4E1FF)),
        ),
      ),
    );
  }
}
