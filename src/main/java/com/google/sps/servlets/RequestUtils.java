package com.google.sps.servlets;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import com.google.sps.servlets.Property;

public class RequestUtils {
  
 /**
  * Given an HTTP request object, this method will get the correlator parameter
  * and return it. Returns an empty string if correlator is not given.
  */
  public static String getCorrelator(HttpServletRequest request) {
    String correlator = request.getParameter(Property.CORRELATOR);

    if (correlator == null) {
      return "";
    }

    return correlator;
  }
}