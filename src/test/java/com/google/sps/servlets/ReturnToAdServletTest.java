package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import static org.mockito.Mockito.Mock;

@RunWith(JUnit4.class)
public final class ReturnToAdServletTest {

  @Test
  public void testCorrectStatusSent() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("Person1");

    new ReturnToAdServlet().doGet(request, response);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
  }

  @Test
  public void checkIfBadRequestStatusSentNull() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn(null);

    new ReturnToAdServlet().doGet(request, response);

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }

  @Test
  public void checkIfBadRequestStatusSentEmpty() {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("correlator")).thenReturn("");

    new ReturnToAdServlet().doGet(request, response);

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
  }
}