package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import static org.mockito.Mockito.Mock;
import com.google.sps.servlets.RequestUtils;

@RunWith(JUnit4.class)
public final class RequestUtilsTest {

  @Test
  public void testCorrelatorValid() {
    HttpServletRequest request = mock(HttpServletRequest.class);    

    when(request.getParameter("correlator")).thenReturn("Person1");
    
    assertEquals(RequestUtils.getCorrelator(request), "Person1");
  }

  @Test
  public void testCorrelatorInvalid() {
    HttpServletRequest request = mock(HttpServletRequest.class);    

    when(request.getParameter("correlator")).thenReturn("");
    
    assertEquals(RequestUtils.getCorrelator(request), "");
  }

  @Test
  public void testCorrelatorNull() {
    HttpServletRequest request = mock(HttpServletRequest.class);    

    when(request.getParameter("correlator")).thenReturn(null);
    
    assertEquals(RequestUtils.getCorrelator(request), "");
  }
}