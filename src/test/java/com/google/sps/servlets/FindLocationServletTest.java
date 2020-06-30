package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import org.mockito.Mockito.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public final class FindLocationServletTest {

  @Test
  public void testCorrectStatusSent() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("Person1");

    new FindLocationServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_OK, response.getStatus());
  }

  @Test
  public void testIfBadRequestStatusSentNull() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn(null);

    new FindLocationServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }

  @Test
  public void testIfBadRequestStatusSentEmpty() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("");

    new FindLocationServlet().doGet(request, response);

    Assert.assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }
}