package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/returnToAd")
public class ReturnToAdServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    response.getWriter().println("<h1>Return to Ad</h1>");
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.sendRedirect("/returnToAd");
  }
}