import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';

class ApiException implements Exception {
  ApiException(this.message, [this.status]);
  final String message;
  final int? status;

  @override
  String toString() => message;
}

/// Thin JSON client around package:http. The token is set by AppState after login.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  String? token;
  void Function()? onUnauthorized;

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final q = <String, String>{};
    query?.forEach((k, v) {
      if (v != null && '$v'.isNotEmpty) q[k] = '$v';
    });
    return Uri.parse('${AppConfig.apiUrl}$path').replace(queryParameters: q.isEmpty ? null : q);
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? query}) =>
      _send(() => http.get(_uri(path, query), headers: _headers));

  Future<Map<String, dynamic>> post(String path, [Object? body]) =>
      _send(() => http.post(_uri(path), headers: _headers, body: jsonEncode(body ?? {})));

  Future<Map<String, dynamic>> patch(String path, [Object? body]) =>
      _send(() => http.patch(_uri(path), headers: _headers, body: jsonEncode(body ?? {})));

  Future<Map<String, dynamic>> delete(String path) =>
      _send(() => http.delete(_uri(path), headers: _headers));

  Future<Map<String, dynamic>> _send(Future<http.Response> Function() request) async {
    http.Response res;
    try {
      res = await request().timeout(const Duration(seconds: 25));
    } catch (_) {
      throw ApiException('Cannot reach the server. Check your internet connection.');
    }
    Map<String, dynamic> data = {};
    if (res.body.isNotEmpty) {
      try {
        data = jsonDecode(res.body) as Map<String, dynamic>;
      } catch (_) {}
    }
    if (res.statusCode >= 200 && res.statusCode < 300) return data;
    if (res.statusCode == 401 && token != null) onUnauthorized?.call();
    throw ApiException(data['message']?.toString() ?? 'Something went wrong (${res.statusCode})', res.statusCode);
  }
}
