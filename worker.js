export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 让 Assets 绑定处理所有静态文件请求
    return new Response('Not found', { status: 404 });
  }
};
